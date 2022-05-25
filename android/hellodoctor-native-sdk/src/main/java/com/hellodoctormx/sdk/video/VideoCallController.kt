package com.hellodoctormx.sdk.video

import android.annotation.SuppressLint
import android.content.Context
import android.media.*
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import com.hellodoctormx.sdk.video.listeners.ActiveRoomListener
import com.twilio.video.*
import com.twilio.video.ktx.enabled
import tvi.webrtc.Camera1Enumerator

interface VideoCallEventHandler {
    fun onEvent(eventData:Bundle)
}

class VideoCallController(val context: Context) {
    private val tag = "VideoCallController"

    private val screenController: ScreenController = ScreenController(context)
    val cameraController = CameraController(context)
    val localVideoController = LocalVideoController(context, cameraController)
    val localAudioController = LocalAudioController(context)

    var remoteParticipantView: RemoteParticipantView? = null

    private val allEventHandlers = mutableMapOf<String, MutableList<VideoCallEventHandler>>()

    fun connect(videoRoomSID: String, accessToken: String) {
        val self = this

        val localAudioTrack = localAudioController.prepareLocalAudio()
        val localVideoTrack = localVideoController.startLocalCapture()

        val connectOptions = ConnectOptions.Builder(accessToken)
            .roomName(videoRoomSID)
            .audioTracks(listOf(localAudioTrack))
            .videoTracks(listOf(localVideoTrack))
            .enableAutomaticSubscription(true)
            .encodingParameters(EncodingParameters(16, 0))
            .build()

        val room = Video.connect(context, connectOptions, ActiveRoomListener(self))
        room.localParticipant?.publishTrack(localVideoTrack)

        screenController.setScreenAlwaysOn(true)

        activeRoom = ActiveRoom(room)
    }

    fun disconnect() {
        localAudioController.stopLocalAudio()
        localVideoController.stopLocalCapture()

        screenController.setScreenAlwaysOn(false)

        activeRoom?.room?.disconnect()
        activeRoom?.room = null
        activeRoom = null
    }

    fun isConnectedToRoom(roomName: String): Boolean {
        return activeRoom?.room?.name == roomName
    }

    fun setLocalParticipantView(localParticipantView: LocalParticipantView?) {
        localVideoController.localParticipantView = localParticipantView
    }

    fun startLocalCapture() {
        localVideoController.startLocalCapture()
    }

    fun renderRemoteParticipant(remoteView: VideoView, remoteParticipantIdentity: String) {
        val remoteParticipant = activeRoom?.room?.remoteParticipants?.find { it.identity == remoteParticipantIdentity }
            ?: run {
                Log.w("$tag:renderRemoteParticipant", "no remote participant found with identity $remoteParticipantIdentity")
                return
            }

        for (remoteVideoTrackPublication in remoteParticipant.remoteVideoTracks) {
            if (!remoteVideoTrackPublication.isTrackSubscribed) {
                continue
            }


            val remoteVideoTrack = remoteVideoTrackPublication.remoteVideoTrack ?: continue
            remoteVideoTrack.addSink(remoteView)

            val data = Bundle()
            data.putString("action", "renderedParticipant");
            data.putString("participantIdentity", remoteParticipant.identity);

            sendEvent("participantVideoEvent", data);
        }
    }

    fun sendEvent(eventName: String, params: Bundle) {
        val eventHandlers = allEventHandlers[eventName] ?: return

        for (handler in eventHandlers) {
            handler.onEvent(params)
        }
    }

    companion object {
        var activeRoom: ActiveRoom? = null

        @SuppressLint("StaticFieldLeak")
        var instance: VideoCallController? = null

        fun getInstance(context: Context): VideoCallController {
            if (instance == null) {
                instance = VideoCallController(context)
            }

            return instance!!
        }
    }
}

class ScreenController(val context: Context) {
    fun setScreenAlwaysOn(alwaysOn: Boolean) {
        context.getActivity()?.let {
            it.runOnUiThread {
                if (alwaysOn) {
                    it.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                } else {
                    it.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                }
            }
        }
    }
}

class LocalVideoController(val context: Context, private val cameraController: CameraController) {
    private val tag = "LocalVideoController"

    var localVideoTrack: LocalVideoTrack? = null
    var localParticipantView: LocalParticipantView? = null

    fun startLocalCapture(): LocalVideoTrack {
        val cameraCapturer = cameraController.getCameraCapturer()

        if (localVideoTrack == null) {
            val videoFormat = VideoFormat(VideoDimensions.VGA_VIDEO_DIMENSIONS, 24)
            localVideoTrack = LocalVideoTrack.create(context, true, cameraCapturer, videoFormat)
        }

        val localVideoTrack = this.localVideoTrack ?: "no local video track".let {
            Log.w("$tag:startLocalCapture", it)
            throw Error(it)
        }

        for (sink in localVideoTrack.sinks) {
            localVideoTrack.removeSink(sink)
        }

        localParticipantView?.let {
            localVideoTrack.addSink(it)
        }

        return localVideoTrack
    }

    fun stopLocalCapture() {
        val cameraCapturer = cameraController.getCameraCapturer()
        cameraCapturer.stopCapture()

        localVideoTrack?.release()
        localVideoTrack = null

        localParticipantView = null
    }

    fun setCapturerEnabled(enabled: Boolean) {
        localVideoTrack?.enabled = enabled
    }
}

class LocalAudioController(val context: Context) {
    private var audioManager: AudioManager
    private var focusRequest: AudioFocusRequest? = null
    private var originalAudioMode = AudioManager.MODE_NORMAL

    var ringtone: Ringtone

    var localAudioTrack: LocalAudioTrack? = null

    init {
        val ringtoneSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
        ringtone = RingtoneManager.getRingtone(context, ringtoneSound)

        audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    }

    fun prepareLocalAudio(): LocalAudioTrack {
        if (localAudioTrack == null) {
            localAudioTrack = LocalAudioTrack.create(context, true)
        }

        return localAudioTrack!!
    }

    fun stopLocalAudio() {
        unsetAudioFocus()

        localAudioTrack?.release()
        localAudioTrack = null
    }

    fun setRingtonePlaying(shouldPlayRingtone: Boolean) {
        if (shouldPlayRingtone) ringtone.play() else ringtone.stop()
    }

    fun setMicrophoneEnabled(enabled: Boolean) {
        localAudioTrack?.enabled = enabled
    }

    fun setSpeakerphoneEnabled(enabled: Boolean) {
        setAudioFocus()
        audioManager.isSpeakerphoneOn = enabled
    }

    private fun setAudioFocus() {
        originalAudioMode = audioManager.mode

        // Some devices have difficulties with speaker mode if this is not set.
        audioManager.mode = AudioManager.MODE_IN_COMMUNICATION

        // Request audio focus before making any device switch
        if (Build.VERSION.SDK_INT >= 26) {
            val playbackAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build()

            focusRequest =
                AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE)
                    .setAudioAttributes(playbackAttributes)
                    .setAcceptsDelayedFocusGain(true)
                    .setOnAudioFocusChangeListener { }
                    .build().apply {
                        audioManager.requestAudioFocus(this)
                    }
        } else {
            audioManager.requestAudioFocus(
                null,
                AudioManager.STREAM_VOICE_CALL,
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE
            )
        }
    }

    private fun unsetAudioFocus() {
        audioManager.mode = originalAudioMode
        if (Build.VERSION.SDK_INT >= 26) {
            if (focusRequest != null) {
                audioManager.abandonAudioFocusRequest(focusRequest!!)
            }
        } else {
            audioManager.abandonAudioFocus(null)
        }
    }
}

class CameraController(val context: Context) {
    private var cameraCapturer: CameraCapturer? = null
    private var cameraEnumerator = Camera1Enumerator()

    fun getCameraCapturer(): CameraCapturer {
        if (cameraCapturer == null) {
            cameraCapturer = getFrontCameraID()?.let { CameraCapturer(context, it) }
                ?: throw Error("no front camera available")
        }

        return cameraCapturer as CameraCapturer
    }

    fun switchCamera() {
        val cameraCapturer = this.cameraCapturer ?: return

        val newCameraID = (
                if (cameraCapturer.cameraId == getFrontCameraID()) getBackCameraID()
                else getFrontCameraID()
        ) ?: return

        cameraCapturer.switchCamera(newCameraID)
    }

    private fun getFrontCameraID(): String? {
        return cameraEnumerator.deviceNames.find { cameraEnumerator.isFrontFacing(it) }
    }

    private fun getBackCameraID(): String? {
        return cameraEnumerator.deviceNames.find { cameraEnumerator.isBackFacing(it) }
    }
}

data class ActiveRoom(
    var room: Room?,
)
