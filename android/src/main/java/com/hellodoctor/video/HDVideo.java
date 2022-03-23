package com.hellodoctor.video;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.ToneGenerator;
import android.os.Build;
import android.os.Handler;
import android.util.Log;
import android.view.WindowManager;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.hellodoctor.video.managers.EventManager;
import com.hellodoctor.video.managers.SoundPoolManager;
import com.twilio.video.CameraCapturer;
import com.twilio.video.ConnectOptions;
import com.twilio.video.EncodingParameters;
import com.twilio.video.LocalAudioTrack;
import com.twilio.video.LocalParticipant;
import com.twilio.video.LocalVideoTrack;
import com.twilio.video.RemoteParticipant;
import com.twilio.video.RemoteVideoTrack;
import com.twilio.video.RemoteVideoTrackPublication;
import com.twilio.video.Room;
import com.twilio.video.Video;
import com.twilio.video.VideoDimensions;
import com.twilio.video.VideoFormat;
import com.twilio.video.VideoTextureView;
import com.twilio.video.VideoView;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nonnull;

import tvi.webrtc.Camera1Enumerator;
import tvi.webrtc.VideoSink;

public class HDVideo extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {
    public static String TAG = "HDVideo";

    private static HDVideo instance;

    private Room mRoom;
    private LocalVideoTrack mLocalVideoTrack;
    private LocalAudioTrack mLocalAudioTrack;
    private VideoTextureView mLocalParticipantView;

    private AudioManager audioManager;
    private ToneGenerator dtmfGenerator;
    private Handler outboundRingingHandler;
    private Runnable outboundRingingRunnable;

    private int originalAudioMode = AudioManager.MODE_NORMAL;
    private AudioFocusRequest focusRequest;

    private Map<String, HDVideoRemoteView> mRemoteVideoViews = new HashMap<>();
    private RemoteParticipant.Listener remoteParticipantListener;

    private VideoTextureView portalView;
    private RemoteParticipant portalParticipant;
    private RemoteVideoTrack portalParticipantTrack;

    private EventManager eventManager;

    private CameraCapturer cameraCapturer;
    private final Camera1Enumerator camera1Enumerator = new Camera1Enumerator();

    HDVideo(ReactApplicationContext reactContext) {
        super(reactContext);

        eventManager = new EventManager(reactContext);

        remoteParticipantListener = new TwilioRemoteParticipantListener(this);

        audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
        dtmfGenerator = new ToneGenerator(AudioManager.STREAM_NOTIFICATION, ToneGenerator.MAX_VOLUME);

        instance = this;
    }

    public static HDVideo getInstance(ReactApplicationContext context) {
        if (instance == null) {
            instance = new HDVideo(context);
        }

        return instance;
    }

    @Nonnull
    @Override
    public String getName() {
        return TAG;
    }

    RemoteParticipant.Listener remoteParticipantListener() {
        return remoteParticipantListener;
    }

    void setRemoteParticipantVideoView(HDVideoRemoteView videoView, @Nullable String participantIdentity) {
        if (participantIdentity == null) {
            return;
        }

        mRemoteVideoViews.put(participantIdentity, videoView);

        tryRenderRemoteParticipant(videoView, participantIdentity);
    }

    void tryRenderRemoteParticipant(@NonNull VideoView remoteView, String participantIdentity) {
        Activity currentActivity = getContext().getCurrentActivity();

        if (currentActivity == null) {
            Log.w(TAG, "Can't add remote video renderer: no current activity found");
            return;
        }

        for (RemoteParticipant remoteParticipant : mRoom.getRemoteParticipants()) {
            if (!remoteParticipant.getIdentity().equals(participantIdentity)) {
                continue;
            }

            for (RemoteVideoTrackPublication remoteVideoTrackPublication : remoteParticipant.getRemoteVideoTracks()) {
                if (!remoteVideoTrackPublication.isTrackSubscribed()) {
                    continue;
                }

                RemoteVideoTrack remoteVideoTrack = remoteVideoTrackPublication.getRemoteVideoTrack();

                if (remoteVideoTrack == null) {
                    continue;
                }

                HDVideo self = this;

                currentActivity.runOnUiThread(() -> {
                    remoteVideoTrack.addSink(remoteView);

                    WritableMap data = Arguments.createMap();
                    data.putString("action", "renderedParticipant");
                    data.putString("participantIdentity", participantIdentity);

                    self.sendEvent("participantVideoEvent", data);
                });

                break;
            }
        }
    }

    void setPortalView(HDVideoPortalView portalView) {
        this.portalView = portalView;
    }

    void setPortalParticipantIdentity(String participantIdentity) {
        for (RemoteParticipant remoteParticipant : mRoom.getRemoteParticipants()) {
            if (remoteParticipant.getIdentity().equals(participantIdentity)) {
                RemoteVideoTrackPublication publishedRemoteParticipantTrack = remoteParticipant.getRemoteVideoTracks().get(0);

                this.portalParticipant = remoteParticipant;
                this.portalParticipantTrack = publishedRemoteParticipantTrack.getRemoteVideoTrack();

                this.portalParticipantTrack.addSink(this.portalView);
            }
        }
    }

    HDVideoRemoteView getParticipantVideoView(String participantIdentity) {
        return mRemoteVideoViews.get(participantIdentity);
    }

    void setLocalView(@NonNull HDVideoLocalView localVideoView) {
        prepareLocalVideo();

        mLocalParticipantView = localVideoView;

        for (VideoSink sink : mLocalVideoTrack.getSinks()) {
            mLocalVideoTrack.removeSink(sink);
        }

        mLocalVideoTrack.addSink(mLocalParticipantView);

        WritableMap data = Arguments.createMap();
        data.putString("status", "ready");

        this.sendEvent("localViewStatus", data);
    }

    @ReactMethod
    public void startLocalCapture(Promise promise) {
        prepareLocalMedia();

        promise.resolve("");
    }

    public void prepareLocalMedia() {
        prepareLocalAudio();
        prepareLocalVideo();
    }

    public void prepareLocalAudio() {
        if (mLocalAudioTrack == null) {
            mLocalAudioTrack = LocalAudioTrack.create(getReactApplicationContext(), true);
        }
    }

    public void prepareLocalVideo() {
        if (cameraCapturer == null) {
            cameraCapturer = new CameraCapturer(getReactApplicationContext(), getFrontCameraId());
        }

        if (mLocalVideoTrack == null) {
            VideoFormat videoFormat = new VideoFormat(VideoDimensions.VGA_VIDEO_DIMENSIONS, 24);

            mLocalVideoTrack = LocalVideoTrack.create(getReactApplicationContext(), true, cameraCapturer, videoFormat);
        }
    }

    @ReactMethod
    public void stopLocalCapture(Promise promise) {
//        stopLocalCapture();

        promise.resolve("");
    }

    public void stopLocalCapture() {
        if (cameraCapturer != null) {
            cameraCapturer.stopCapture();
            cameraCapturer = null;
            mLocalVideoTrack = null;
        }
    }


    @ReactMethod
    public void connect(String roomName, String accessToken, Promise promise) {
        prepareLocalMedia();

        ConnectOptions connectOptions = new ConnectOptions.Builder(accessToken)
                .roomName(roomName)
                .audioTracks(Collections.singletonList(mLocalAudioTrack))
                .videoTracks(Collections.singletonList(mLocalVideoTrack))
                .enableAutomaticSubscription(true)
                .encodingParameters(new EncodingParameters(16, 0))
                .build();

        mRoom = Video.connect(getReactApplicationContext(), connectOptions, new TwilioRoomListener(this));

        LocalParticipant localParticipant = mRoom.getLocalParticipant();

        if (localParticipant != null && mLocalVideoTrack != null) {
            localParticipant.publishTrack(mLocalVideoTrack);
        }

        if (mLocalParticipantView != null && mLocalVideoTrack != null && mLocalVideoTrack.getSinks().size() == 0) {
            mLocalVideoTrack.addSink(mLocalParticipantView);
        }

        setScreenAlwaysOn(true);

        WritableMap map = Arguments.createMap();
        map.putString("name", this.mRoom.getName());
        map.putString("sid", this.mRoom.getSid());
        map.putString("state", this.mRoom.getState().name());

        promise.resolve(map);
    }

    @ReactMethod
    public void isConnectedToRoom(String roomName, Promise promise) {
        promise.resolve(mRoom != null && mRoom.getName().equals(roomName));
    }

    @ReactMethod
    public void getRemoteParticipants(Promise promise) {
        if (mRoom == null) {
            promise.resolve(null);
        } else {
            WritableArray remoteParticipantIdentities = Arguments.createArray();

            for (RemoteParticipant remoteParticipant : mRoom.getRemoteParticipants()) {
                remoteParticipantIdentities.pushString(remoteParticipant.getIdentity());
            }

            promise.resolve(remoteParticipantIdentities);
        }
    }

    @ReactMethod
    public void disconnect(Promise promise) {
        this.unsetAudioFocus();

        setScreenAlwaysOn(false);

        stopLocalCapture();

        if (mRoom != null) {
            mRoom.disconnect();
            mRoom = null;
        }

        if (mLocalAudioTrack != null) {
            mLocalAudioTrack.release();
            mLocalAudioTrack = null;
        }

        if (mLocalVideoTrack != null) {
            mLocalVideoTrack.release();
            mLocalVideoTrack = null;
        }

        mRemoteVideoViews.clear();

        promise.resolve("disconnected");
    }

    @ReactMethod
    public void reject(Promise promise) {
        SoundPoolManager.getInstance(getReactApplicationContext()).stopRinging();
        WritableMap params = Arguments.createMap();
        eventManager.sendEvent("connectionDidDisconnect", params);
        promise.resolve("");
    }

    @ReactMethod
    public void setVideoPublished(Boolean published, Promise promise) {
        if (mRoom == null || mRoom.getLocalParticipant() == null || mLocalVideoTrack == null) {
            promise.reject(new Error("no room and/or local participant and/or local video track"));
            return;
        }

        LocalParticipant localParticipant = mRoom.getLocalParticipant();

        if (published) {
            localParticipant.publishTrack(mLocalVideoTrack);
        } else {
            localParticipant.unpublishTrack(mLocalVideoTrack);
        }

        promise.resolve("");
    }

    @ReactMethod
    public void setVideoEnabled(Boolean enabled, Promise promise) {
        if (mLocalVideoTrack == null) {
            promise.reject(new Error("local video track was destroyed"));
            return;
        }

        mLocalVideoTrack.enable(enabled);

        promise.resolve("");
    }

    @ReactMethod
    public void setAudioEnabled(Boolean enabled, Promise promise) {
        if (mLocalAudioTrack == null) {
            promise.reject(new Error("local audio track was destroyed"));
            return;
        }

        mLocalAudioTrack.enable(enabled);

        promise.resolve("");
    }

    @ReactMethod
    public void flipCamera(Promise promise) {
        String currentCameraID = cameraCapturer.getCameraId();

        if (currentCameraID.equals(getFrontCameraId()) && getBackCameraId() != null) {
            cameraCapturer.switchCamera(getBackCameraId());
        } else if (getFrontCameraId() != null){
            cameraCapturer.switchCamera(getFrontCameraId());
        }

        promise.resolve("");
    }

    @ReactMethod
    public void setSpeakerPhone(Boolean value, Promise promise) {
        if (setSpeakerPhone(value)) {
            promise.resolve("");
        } else {
            promise.reject(new Error("could not set speaker phone"));
        }
    }

    @SuppressLint("WrongConstant")
    @ReactMethod
    public void wakeMainActivity(Promise promise) {
        Context context = getContext();

        String packageName = context.getApplicationContext().getPackageName();
        Intent focusIntent = context.getPackageManager().getLaunchIntentForPackage(packageName).cloneFilter();
        focusIntent.setFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        focusIntent.setAction(Intent.ACTION_MAIN);

        Activity currentActivity = getCurrentActivity();

        if (currentActivity != null) {
            currentActivity.startActivity(focusIntent);
        } else {
            focusIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            focusIntent.addCategory(Intent.CATEGORY_LAUNCHER);

            getReactApplicationContext().startActivity(focusIntent);
        }

        promise.resolve("");
    }

    public boolean setSpeakerPhone(Boolean value) {
        if (audioManager == null) {
            return false;
        }

        setAudioFocus();
        audioManager.setSpeakerphoneOn(value);

        return true;
    }

    private void setScreenAlwaysOn(Boolean alwaysOn) {
        Activity currentActivity = this.getContext().getCurrentActivity();

        if (currentActivity == null) {
            Log.w(TAG, "Can't add remote video renderer: no current activity found");
            return;
        }

        currentActivity.runOnUiThread(() -> {
            Log.i(TAG, String.format("setting screen always on %b", alwaysOn));

            if (alwaysOn) {
                currentActivity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            } else {
                currentActivity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            }
        });
    }

    private void setAudioFocus() {
        originalAudioMode = audioManager.getMode();
        // Request audio focus before making any device switch
        if (Build.VERSION.SDK_INT >= 26) {
            AudioAttributes playbackAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build();
            focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE)
                    .setAudioAttributes(playbackAttributes)
                    .setAcceptsDelayedFocusGain(true)
                    .setOnAudioFocusChangeListener(new AudioManager.OnAudioFocusChangeListener() {
                        @Override
                        public void onAudioFocusChange(int i) {
                        }
                    })
                    .build();
            audioManager.requestAudioFocus(focusRequest);
        } else {
            audioManager.requestAudioFocus(
                    null,
                    AudioManager.STREAM_VOICE_CALL,
                    AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE
            );
        }
        /*
         * Start by setting MODE_IN_COMMUNICATION as default audio mode. It is
         * required to be in this mode when playout and/or recording starts for
         * best possible VoIP performance. Some devices have difficulties with speaker mode
         * if this is not set.
         */
        audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
    }

    private void unsetAudioFocus() {
        if (audioManager == null) {
            return;
        }
        audioManager.setMode(originalAudioMode);
        if (Build.VERSION.SDK_INT >= 26) {
            if (focusRequest != null) {
                audioManager.abandonAudioFocusRequest(focusRequest);
            }
        } else {
            audioManager.abandonAudioFocus(null);
        }
    }

    private String getFrontCameraId() {
        for (String deviceName : camera1Enumerator.getDeviceNames()) {
            if (camera1Enumerator.isFrontFacing(deviceName)) {
                return deviceName;
            }
        }

        return null;
    }

    private String getBackCameraId() {
        for (String deviceName : camera1Enumerator.getDeviceNames()) {
            if (camera1Enumerator.isBackFacing(deviceName)) {
                return deviceName;
            }
        }

        return null;
    }

    void sendEvent(String eventName, @Nullable WritableMap params) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    public ReactApplicationContext getContext() {
        return getReactApplicationContext();
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {

    }

    @Override
    public void onNewIntent(Intent intent) {

    }

    @Override
    public void onHostResume() {
        /*
         * Enable changing the volume using the up/down keys during a conversation
         */
        getCurrentActivity().setVolumeControlStream(AudioManager.STREAM_VOICE_CALL);
    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {
        this.unsetAudioFocus();
    }
}
