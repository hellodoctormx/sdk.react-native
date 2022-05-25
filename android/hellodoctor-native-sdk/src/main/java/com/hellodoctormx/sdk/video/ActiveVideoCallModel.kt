package com.hellodoctormx.sdk.video

import android.app.Activity
import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.hellodoctormx.sdk.HelloDoctorClient
import com.hellodoctormx.sdk.api.VideoServiceClient
import kotlinx.coroutines.launch

class ActiveVideoCallModel : ViewModel() {
    var isConnected by mutableStateOf(false)
    var isCameraEnabled by mutableStateOf(false)
    var isMicrophoneEnabled by mutableStateOf(true)
    var activeCamera by mutableStateOf("front")

    fun doConnect(context: Context) {
        val videoCallController = VideoCallController.getInstance(context)
        val videoServiceClient = VideoServiceClient(context)
        val videoRoomSID = HelloDoctorClient.IncomingVideoCall.videoRoomSID!!

        viewModelScope.launch {
            val videoAccessTokenResponse = videoServiceClient.requestVideoCallAccess(videoRoomSID)

            videoCallController.connect(
                videoRoomSID = videoRoomSID,
                accessToken = videoAccessTokenResponse.accessToken
            )

            isConnected = true
        }
    }

    fun doDisconnect(context: Context) {
        val videoCallController = VideoCallController.getInstance(context)
        videoCallController.disconnect()

        isConnected = false

        (context as Activity).finish()
    }

    fun toggleCameraEnabled(context: Context) {
        isCameraEnabled = !isCameraEnabled

        val videoCallController = VideoCallController.getInstance(context)
        videoCallController.localVideoController.setCapturerEnabled(isCameraEnabled)
    }

    fun toggleMicrophoneEnabled(context: Context) {
        isMicrophoneEnabled = !isMicrophoneEnabled

        val videoCallController = VideoCallController.getInstance(context)
        videoCallController.localAudioController.setMicrophoneEnabled(isMicrophoneEnabled)
    }

    fun toggleCamera(context: Context) {
        val videoCallController = VideoCallController.getInstance(context)
        videoCallController.cameraController.switchCamera()

        activeCamera = if (activeCamera == "front") "back" else "front"
    }
}