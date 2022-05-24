package com.hellodoctormx.sdk.video

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.Icon
import androidx.compose.material.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.zIndex
import com.hellodoctormx.sdk.HelloDoctorClient
import com.hellodoctormx.sdk.R
import com.hellodoctormx.sdk.ui.theme.Gray500
import com.hellodoctormx.sdk.ui.theme.Gray900
import com.hellodoctormx.sdk.ui.theme.Green200
import com.hellodoctormx.sdk.ui.theme.Red500
import com.hellodoctormx.sdk.video.ui.theme.HelloDoctorSDKTheme

fun Context.getActivity(): AppCompatActivity? = when (this) {
    is AppCompatActivity -> this
    is ContextWrapper -> baseContext.getActivity()
    else -> null
}

@Composable
fun LocalParticipantAndroidView() {
    AndroidView(factory = { context ->
        LocalParticipantView(context).apply {
            val videoCallController = VideoCallController.getInstance(context)
            videoCallController.setLocalParticipantView(this)
            videoCallController.startLocalCapture()
        }
    })
}

@Composable
fun RemoteParticipantAndroidView() {
    AndroidView(factory = { context ->
        RemoteParticipantView(context).apply {
            val videoCallController = VideoCallController.getInstance(context)
            videoCallController.remoteParticipantView = this
        }
    }, modifier = Modifier.zIndex(0f))
}

@Preview(showBackground = true)
@Composable
fun ActiveVideoCallControlsPreview() {
    ActiveVideoCallControls(ActiveVideoCallModel())
}

@Composable
fun ActiveVideoCallControls(activeVideoCallModel: ActiveVideoCallModel) {
    HelloDoctorSDKTheme {
        Surface(
            shape = CircleShape,
            modifier = Modifier.padding(12.dp),
            color = Gray900
        ) {
            Row {
                EndCallControl(activeVideoCallModel)
                ToggleCameraEnabledButton(activeVideoCallModel)
                ToggleMicrophoneEnabledButton(activeVideoCallModel)
                ToggleCameraButton(activeVideoCallModel)
            }
        }
    }
}

@Composable
fun IncomingVideoCallControls(activeVideoCallModel: ActiveVideoCallModel) {
    HelloDoctorSDKTheme {
        Surface(
            shape = CircleShape,
            modifier = Modifier.padding(12.dp),
            color = Gray900
        ) {
            Row {
                EndCallControl(activeVideoCallModel)
                StartCallControl(activeVideoCallModel)
            }
        }
    }
}

@Composable
fun StartCallControl(activeVideoCallModel: ActiveVideoCallModel) {
    val context = LocalContext.current

    ActiveCallControlButton(
        iconResource = R.drawable.ic_phone_solid,
        iconRotateDegrees = 135f,
        background = Green200,
        controlDescription = "endCall",
        onClick = { activeVideoCallModel.doConnect(context) }
    )
}

@Composable
fun EndCallControl(activeVideoCallModel: ActiveVideoCallModel) {
    val context = LocalContext.current

    ActiveCallControlButton(
        iconResource = R.drawable.ic_phone_solid,
        iconRotateDegrees = 135f,
        background = Red500,
        controlDescription = "endCall",
        onClick = { activeVideoCallModel.doDisconnect(context) }
    )
}

@Composable
fun ToggleCameraEnabledButton(activeVideoCallModel: ActiveVideoCallModel) {
    val context = LocalContext.current

    ActiveCallControlButton(
        iconResource = if (activeVideoCallModel.isCameraEnabled) R.drawable.ic_video_solid else R.drawable.ic_video_slash_solid,
        controlDescription = "toggleVideo",
        onClick = {
            activeVideoCallModel.toggleCameraEnabled(context)
        }
    )
}

@Composable
fun ToggleMicrophoneEnabledButton(activeVideoCallModel: ActiveVideoCallModel) {
    val context = LocalContext.current

    ActiveCallControlButton(
        iconResource = if (activeVideoCallModel.isMicrophoneEnabled) R.drawable.ic_microphone_solid else R.drawable.ic_microphone_slash_solid,
        controlDescription = "toggleAudio",
        onClick = {
            activeVideoCallModel.toggleMicrophoneEnabled(context)
        }
    )
}

@Composable
fun ToggleCameraButton(activeVideoCallModel: ActiveVideoCallModel) {
    val context = LocalContext.current

    ActiveCallControlButton(
        iconResource = R.drawable.ic_arrows_rotate_solid,
        iconRotateDegrees = if (activeVideoCallModel.activeCamera == "front") 0f else 90f,
        controlDescription = "toggleAudio",
        onClick = {
            activeVideoCallModel.toggleCamera(context)
        }
    )
}

@Composable
fun ActiveCallControlButton(
    iconResource: Int,
    iconRotateDegrees: Float = 0f,
    controlDescription: String,
    background: Color = Gray500,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier.padding(12.dp)
    ) {
        Box(modifier = Modifier
            .size(48.dp)
            .clip(CircleShape)
            .background(background)
            .clickable { onClick() }
        ) {
            Icon(
                painter = painterResource(id = iconResource),
                contentDescription = controlDescription,
                tint = Color.White,
                modifier = Modifier
                    .size(24.dp)
                    .padding(2.dp)
                    .rotate(iconRotateDegrees)
                    .align(Alignment.Center)
            )
        }
    }
}