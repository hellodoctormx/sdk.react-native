package com.hellodoctormx.rn.video;

import android.content.Intent;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.hellodoctormx.sdk.video.VideoCallController;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class HDVideoModule extends ReactContextBaseJavaModule implements ActivityEventListener, LifecycleEventListener {
    public static String TAG = "HDVideoModule";

    private final VideoCallController videoCallController;

    private static HDVideoModule instance;

    HDVideoModule(ReactApplicationContext reactContext) {
        super(reactContext);

        videoCallController = VideoCallController.Companion.getInstance(reactContext);
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
