package com.hellodoctormx.reactnative

import android.app.Activity
import android.content.Intent
import com.facebook.react.bridge.*
import com.hellodoctormx.sdk.HelloDoctorClient
import com.hellodoctormx.sdk.video.IncomingVideoCallNotification
import com.hellodoctormx.sdk.video.VideoCallController
import com.hellodoctormx.sdk.video.VideoCallController.Companion.getInstance
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.annotation.Nonnull

class RNHelloDoctorModule(reactContext: ReactApplicationContext?) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener, LifecycleEventListener {
    private val videoCallController: VideoCallController

    init {
        HelloDoctorClient.createVideoCallNotificationChannel(this.reactApplicationContext)
    }

    @Nonnull
    override fun getName(): String {
        return TAG
    }

    @ReactMethod
    fun configure(apiKey: String, serviceHost: String, promise: Promise) {
        HelloDoctorClient.configure(apiKey, serviceHost)
        promise.resolve("")
    }

    @ReactMethod
    fun signIn(userID: String, serverAuthToken: String, promise: Promise) {
        val context = this.reactApplicationContext

        CoroutineScope(Dispatchers.Main.immediate).launch {
            HelloDoctorClient.signIn(context, userID, serverAuthToken)
            promise.resolve("")
        }
    }

    @ReactMethod
    fun signInWithJWT(userID: String, jwt: String, promise: Promise) {
        HelloDoctorClient.signInWithJWT(userID, jwt)
        promise.resolve("")
    }

    @ReactMethod
    fun displayIncomingCallNotification(
        videoRoomSID: String,
        callerDisplayName: String,
        callerProfilePhotoURL: String?,
        promise: Promise
    ) {
        IncomingVideoCallNotification.display(this.reactApplicationContext, videoRoomSID, callerDisplayName, callerProfilePhotoURL)
        promise.resolve("")
    }

    @ReactMethod
    fun cancelIncomingCallNotification(promise: Promise) {
        IncomingVideoCallNotification.cancel(this.reactApplicationContext)
        promise.resolve("")
    }

    @ReactMethod
    fun startLocalCapture(promise: Promise) {
        videoCallController.startLocalCapture()
        promise.resolve("")
    }

    @ReactMethod
    fun stopLocalCapture(promise: Promise) {
        videoCallController.localVideoController.stopLocalCapture()
        promise.resolve("")
    }

    @ReactMethod
    fun setVideoEnabled(enabled: Boolean?, promise: Promise) {
        videoCallController.localVideoController.setCapturerEnabled(enabled!!)
        promise.resolve("")
    }

    @ReactMethod
    fun setAudioEnabled(enabled: Boolean?, promise: Promise) {
        videoCallController.localAudioController.setMicrophoneEnabled(enabled!!)
        promise.resolve("")
    }

    @ReactMethod
    fun flipCamera(promise: Promise) {
        videoCallController.cameraController.switchCamera()
        promise.resolve("")
    }

    @ReactMethod
    fun setSpeakerPhone(enabled: Boolean?, promise: Promise) {
        videoCallController.localAudioController.setSpeakerphoneEnabled(enabled!!)
        promise.resolve("")
    }

    override fun onHostResume() {}
    override fun onHostPause() {}
    override fun onHostDestroy() {}

    companion object {
        var TAG = "RNHelloDoctorModule"
        private val instance: RNHelloDoctorModule? = null
    }

    init {
        videoCallController = getInstance(
            reactContext!!
        )
    }

    override fun onActivityResult(
        activity: Activity?,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        TODO("Not yet implemented")
    }

    override fun onNewIntent(intent: Intent?) {
        TODO("Not yet implemented")
    }
}
