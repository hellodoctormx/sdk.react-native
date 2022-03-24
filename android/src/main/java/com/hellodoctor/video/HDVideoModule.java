package com.hellodoctor.video;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;

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
import com.twilio.video.RemoteParticipant;
import com.twilio.video.Room;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class HDVideoModule extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {
    public static String TAG = "HDVideoModule";

    private final HDVideo hdVideo;

    private static HDVideoModule instance;

    HDVideoModule(ReactApplicationContext reactContext) {
        super(reactContext);

        hdVideo = HDVideo.getInstance(reactContext);
    }

    public static HDVideoModule getInstance(ReactApplicationContext reactContext) {
        if (instance == null) {
            instance = new HDVideoModule(reactContext);
        }

        return instance;
    }

    @Nonnull
    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void sendTestEvent(Promise promise) {
        sendEvent("testEvent", null);

        promise.resolve("");
    }

    public void sendEvent(String event, @Nullable WritableMap data) {
        getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(event, data);
    }

    @ReactMethod
    public void startLocalCapture(Promise promise) {
        hdVideo.prepareLocalMedia();

        promise.resolve("");
    }

    @ReactMethod
    public void stopLocalCapture(Promise promise) {
//        stopLocalCapture();

        promise.resolve("");
    }

    @ReactMethod
    public void connect(String roomName, String accessToken, Promise promise) {
        Room connectedRoom = hdVideo.connect(roomName, accessToken);

        WritableMap map = Arguments.createMap();
        map.putString("name", connectedRoom.getName());
        map.putString("sid", connectedRoom.getSid());
        map.putString("state", connectedRoom.getState().name());

        promise.resolve(map);
    }

    @ReactMethod
    public void isConnectedToRoom(String roomName, Promise promise) {
        promise.resolve(hdVideo.isConnectedToRoom(roomName));
    }

    @ReactMethod
    public void getRemoteParticipantIdentities(Promise promise) {
        WritableArray remoteParticipantIdentities = Arguments.createArray();

        for (RemoteParticipant remoteParticipant : hdVideo.getRemoteParticipants()) {
            remoteParticipantIdentities.pushString(remoteParticipant.getIdentity());
        }

        promise.resolve(remoteParticipantIdentities);
    }

    @ReactMethod
    public void disconnect(Promise promise) {
        hdVideo.disconnect();

        promise.resolve("disconnected");
    }

    @ReactMethod
    public void reject(Promise promise) {
        hdVideo.reject();

        promise.resolve("");
    }

    @ReactMethod
    public void setVideoPublished(Boolean published, Promise promise) {
        try {
            hdVideo.setVideoPublished(published);

            promise.resolve("");
        } catch (Exception e) {
            e.printStackTrace();

            promise.reject(new Error("could not set video published status"));
        }
    }

    @ReactMethod
    public void setVideoEnabled(Boolean enabled, Promise promise) {
        try {
            hdVideo.setVideoEnabled(enabled);

            promise.resolve("");
        } catch (Exception e) {
            e.printStackTrace();

            promise.reject(new Error("could not set video enabled status"));
        }
    }

    @ReactMethod
    public void setAudioEnabled(Boolean enabled, Promise promise) {
        try {
            hdVideo.setAudioEnabled(enabled);

            promise.resolve("");
        } catch (Exception e) {
            e.printStackTrace();

            promise.reject(new Error("could not set audio enabled status"));
        }
    }

    @ReactMethod
    public void flipCamera(Promise promise) {
        hdVideo.flipCamera();

        promise.resolve("");
    }

    @ReactMethod
    public void setSpeakerPhone(Boolean value, Promise promise) {
        if (hdVideo.setSpeakerPhone(value)) {
            promise.resolve("");
        } else {
            promise.reject(new Error("could not set speaker phone"));
        }
    }

    @SuppressLint("WrongConstant")
    @ReactMethod
    public void wakeMainActivity(Promise promise) {
        hdVideo.wakeMainActivity();

        promise.resolve("");
    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {

    }

    @Override
    public void onNewIntent(Intent intent) {

    }

    @Override
    public void onHostResume() {

    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {

    }
}
