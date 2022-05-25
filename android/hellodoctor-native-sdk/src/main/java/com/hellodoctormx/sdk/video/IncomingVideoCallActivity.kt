package com.hellodoctormx.sdk.video

import android.content.Context
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Card
import androidx.compose.material.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.zIndex
import androidx.core.app.NotificationManagerCompat
import com.hellodoctormx.sdk.HelloDoctorClient
import com.hellodoctormx.sdk.ui.theme.Blue500
import com.hellodoctormx.sdk.ui.theme.Blue700
import com.hellodoctormx.sdk.ui.theme.HelloDoctorSDKTheme

enum class Actions(val action: String) {
    INCOMING_VIDEO_CALL_ANSWERED("com.hellodoctormx.sdk.action.INCOMING_VIDEO_CALL_ANSWERED"),
    INCOMING_VIDEO_CALL_REJECTED("com.hellodoctormx.sdk.action.INCOMING_VIDEO_CALL_REJECTED")
}

const val INCOMING_VIDEO_CALL_NOTIFICATION_ID = 42
const val INCOMING_VIDEO_CALL_STATE = "INCOMING_VIDEO_CALL_STATE"
const val VIDEO_ROOM_SID = "VIDEO_ROOM_SID"
const val CALLER_DISPLAY_NAME = "CALLER_DISPLAY_NAME"

open class IncomingVideoCallActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val videoRoomSID = intent.getStringExtra(VIDEO_ROOM_SID)
        HelloDoctorClient.IncomingVideoCall.videoRoomSID = videoRoomSID

        val activeVideoCallModel = ActiveVideoCallModel()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        }

        setContent {
            HelloDoctorSDKTheme {
                VideoCallPermissions(
                    content = {
                        when (intent.getStringExtra(INCOMING_VIDEO_CALL_STATE)) {
                            "answered" -> ActiveVideoCallScreen(activeVideoCallModel)
                            "rejected" -> {
                                cancelIncomingCallNotification(this)
                                finish()
                            }
                            else -> IncomingVideoCallScreen(
                                activeVideoCallModel = activeVideoCallModel,
                                callerDisplayName = intent.getStringExtra(CALLER_DISPLAY_NAME)
                            )
                        }
                    }
                )
            }
        }
    }
}

fun cancelIncomingCallNotification(context: Context) {
    VideoCallController.getInstance(context).apply {
        localAudioController.setRingtonePlaying(false)
    }

    val notificationManager = NotificationManagerCompat.from(context)
    notificationManager.cancel(INCOMING_VIDEO_CALL_NOTIFICATION_ID)
}

@Composable
fun IncomingVideoCallScreen(
    activeVideoCallModel: ActiveVideoCallModel,
    callerDisplayName: String? = "HelloDoctor Médico",
    isPreview: Boolean? = false
) {
    if (activeVideoCallModel.isConnected) {
        ActiveVideoCallScreen(activeVideoCallModel = activeVideoCallModel)
    } else {
        Surface(modifier = Modifier.fillMaxSize(), color = Color.Black) {
            if (isPreview != true) LocalParticipantAndroidView()
            Column(
                verticalArrangement = Arrangement.Bottom,
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(2.dp)
            ) {
                IncomingVideoCallControls(activeVideoCallModel)
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun IncomingVideoCallScreenPreview() {
    IncomingVideoCallScreen(activeVideoCallModel = ActiveVideoCallModel(), isPreview = true)
}

@Composable
fun ActiveVideoCallScreen(activeVideoCallModel: ActiveVideoCallModel, isPreview: Boolean? = false) {
    val context = LocalContext.current

    LaunchedEffect(Unit) {
        cancelIncomingCallNotification(context)

        if (!activeVideoCallModel.isConnected) {
            activeVideoCallModel.doConnect(context)
        }
    }

    Surface(modifier = Modifier.fillMaxSize(), color = Color.Black) {
        Box {
            if (isPreview != true) RemoteParticipantAndroidView()
            if (isPreview == true) Box(modifier = Modifier
                .background(Blue500)
                .fillMaxSize()
                .zIndex(0f))
            LocalParticipantPortal(content = {
                Box {
                    if (isPreview != true) LocalParticipantAndroidView()
                }
            })
        }
        Column(
            verticalArrangement = Arrangement.Bottom,
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(2.dp)
        ) {
            ActiveVideoCallControls(activeVideoCallModel)
        }
    }
}

@Composable
fun LocalParticipantPortal(content: @Composable () -> Unit = { }) {
    Column(verticalArrangement = Arrangement.Bottom, modifier = Modifier.fillMaxSize()) {
        Card(
            elevation = 4.dp,
            modifier = Modifier
                .padding(12.dp)
                .width(128.dp)
                .height((1.4 * 128).dp)
                .clip(RoundedCornerShape(6.dp))
                .border(2.dp, Blue700, RoundedCornerShape(6.dp))
        ) {
            Box(modifier = Modifier
                .background(Color.Black)
                .fillMaxSize()
                .zIndex(1f)) {
                content()
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ActiveVideoCallScreenPreview() {
    ActiveVideoCallScreen(ActiveVideoCallModel(), isPreview = true)
}