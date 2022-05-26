package com.hellodoctormx.sdk;

import static android.provider.Settings.System.getString;
import static androidx.core.app.NotificationCompat.VISIBILITY_PUBLIC;
import static androidx.core.content.ContextCompat.getSystemService;
import static com.hellodoctormx.sdk.video.IncomingVideoCallActivityKt.CALLER_DISPLAY_NAME;
import static com.hellodoctormx.sdk.video.IncomingVideoCallActivityKt.INCOMING_VIDEO_CALL_NOTIFICATION_ID;
import static com.hellodoctormx.sdk.video.IncomingVideoCallActivityKt.INCOMING_VIDEO_CALL_ACTION;
import static com.hellodoctormx.sdk.video.IncomingVideoCallActivityKt.VIDEO_ROOM_SID;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.graphics.drawable.IconCompat;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.hellodoctormx.sdk.video.Actions;
import com.hellodoctormx.sdk.video.IncomingVideoCallActivity;
import com.hellodoctormx.sdk.video.VideoCallController;

import javax.annotation.Nonnull;

public class RNHDVideoModule extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {
    public static String TAG = "RNHDVideoModule";

    private final VideoCallController videoCallController;

    private static RNHDVideoModule instance;

    RNHDVideoModule(ReactApplicationContext reactContext) {
        super(reactContext);

        videoCallController = VideoCallController.Companion.getInstance(reactContext);
    }

    @Nonnull
    @Override
    public String getName() {
        return TAG;
    }

    @ReactMethod
    public void displayIncomingCallNotification(String videoRoomSID, String callerDisplayName, Promise promise) {
        Context context = this.getReactApplicationContext();

        HelloDoctorClient client = new HelloDoctorClient(context);
        client.registerIncomingVideoCall(videoRoomSID, callerDisplayName);

        Intent answerCallIntent = new Intent(context, IncomingVideoCallActivity.class);
        answerCallIntent.setAction(Actions.INCOMING_VIDEO_CALL_ANSWERED.getAction());
        answerCallIntent.putExtra(INCOMING_VIDEO_CALL_ACTION, "answered");
        answerCallIntent.putExtra(VIDEO_ROOM_SID, videoRoomSID);
        answerCallIntent.putExtra(CALLER_DISPLAY_NAME, callerDisplayName);

        PendingIntent answerCallPendingIntent = PendingIntent.getActivity(
            context, 0, answerCallIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Action answerCallAction = new NotificationCompat.Action.Builder(
                IconCompat.createWithResource(context, com.hellodoctormx.sdk.R.drawable.ic_video_solid),
                "Contestar",
                answerCallPendingIntent
        ).build();

        Intent rejectCallIntent = new Intent(context, IncomingVideoCallActivity.class);
        rejectCallIntent.setAction(Actions.INCOMING_VIDEO_CALL_REJECTED.getAction());
        rejectCallIntent.putExtra(INCOMING_VIDEO_CALL_ACTION, "rejected");

        PendingIntent rejectCallPendingIntent = PendingIntent.getActivity(
                context, 0, rejectCallIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);

        NotificationCompat.Action rejectCallAction = new NotificationCompat.Action.Builder(
                IconCompat.createWithResource(context, com.hellodoctormx.sdk.R.drawable.ic_video_solid),
                "Colgar",
                rejectCallPendingIntent
        ).build();

        Intent fullScreenIntent = new Intent(context, IncomingVideoCallActivity.class);
        fullScreenIntent.putExtra(VIDEO_ROOM_SID, videoRoomSID);
        fullScreenIntent.putExtra(CALLER_DISPLAY_NAME, callerDisplayName);

        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(context, 0, fullScreenIntent, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        String notificationTitle = String.format("%s de HelloDoctor", callerDisplayName);

        Notification notification = new NotificationCompat
                .Builder(context, "incoming_video_call")
                .setSmallIcon(com.hellodoctormx.sdk.R.drawable.ic_phone_solid)
                .setContentTitle(notificationTitle)
                .setContentText("Tu médico te está llamando para tu asesoría")
                .setOngoing(true)
                .setVisibility(VISIBILITY_PUBLIC)
                .addAction(answerCallAction)
                .addAction(rejectCallAction)
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .build();

        createNotificationChannel();

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        notificationManager.notify(INCOMING_VIDEO_CALL_NOTIFICATION_ID, notification);

        VideoCallController videoCallController = VideoCallController.Companion.getInstance(context);
        videoCallController.getLocalAudioController().setRingtonePlaying(true);

        promise.resolve("");
    }

    private void createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            String channelID = "incoming_video_call";
            String channelName = "Videollamadas";
            String descriptionText = "Videollamadas";

            NotificationChannel channel = new NotificationChannel(channelID, channelName, NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription(descriptionText);

            // Register the channel with the system
            NotificationManager notificationManager = getReactApplicationContext().getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @ReactMethod
    public void startLocalCapture(Promise promise) {
        videoCallController.startLocalCapture();

        promise.resolve("");
    }

    @ReactMethod
    public void stopLocalCapture(Promise promise) {
        videoCallController.getLocalVideoController().stopLocalCapture();
        promise.resolve("");
    }

    @ReactMethod
    public void setVideoEnabled(Boolean enabled, Promise promise) {
        videoCallController.getLocalVideoController().setCapturerEnabled(enabled);
        promise.resolve("");
    }

    @ReactMethod
    public void setAudioEnabled(Boolean enabled, Promise promise) {
        videoCallController.getLocalAudioController().setMicrophoneEnabled(enabled);
        promise.resolve("");
    }

    @ReactMethod
    public void flipCamera(Promise promise) {
        videoCallController.getCameraController().switchCamera();
        promise.resolve("");
    }

    @ReactMethod
    public void setSpeakerPhone(Boolean enabled, Promise promise) {
        videoCallController.getLocalAudioController().setSpeakerphoneEnabled(enabled);
        promise.resolve("");
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

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {

    }
}