package com.hellodoctormx.sdk.video.listeners

import android.os.Bundle
import android.util.Log
import com.hellodoctormx.sdk.video.VideoCallController
import com.twilio.video.RemoteParticipant
import com.twilio.video.Room
import com.twilio.video.TwilioException

class ActiveRoomListener internal constructor(private val videoCallController: VideoCallController) : Room.Listener {
    override fun onConnected(room: Room) {
        Log.d(TAG, "Connected to " + room.name)

        videoCallController.localAudioController.setSpeakerphoneEnabled(true)

        val remoteParticipantIDs = ArrayList<String>()
        for (remoteParticipant in room.remoteParticipants) {
            remoteParticipant.setListener(RemoteParticipantListener(videoCallController))
            remoteParticipantIDs.add(remoteParticipant.identity)
        }
        val data = Bundle()
        data.putStringArrayList("participants", remoteParticipantIDs)
        videoCallController.sendEvent("connectedToRoom", data)
    }

    override fun onConnectFailure(room: Room, twilioException: TwilioException) {
        Log.d(TAG, "Failed to connect to " + room.name + ": " + twilioException)
    }

    override fun onReconnecting(room: Room, twilioException: TwilioException) {
        Log.d(TAG, "Reconnecting to " + room.name + ": " + twilioException)
    }

    override fun onReconnected(room: Room) {
        Log.d(TAG, "Reconnected to " + room.name)
    }

    override fun onDisconnected(room: Room, twilioException: TwilioException?) {
        Log.d(TAG, "Disconnected from " + room.name + ": " + twilioException)
    }

    override fun onParticipantConnected(room: Room, remoteParticipant: RemoteParticipant) {
        val remoteParticipantIdentity = remoteParticipant.identity
        val args = Bundle()
        args.putString("action", "connected")
        args.putString("participantIdentity", remoteParticipantIdentity)
        videoCallController.sendEvent("participantRoomConnectionEvent", args)
        Log.d(TAG, "Participant " + remoteParticipantIdentity + " connected to " + room.name)
        remoteParticipant.setListener(RemoteParticipantListener(videoCallController))
    }

    override fun onParticipantDisconnected(room: Room, remoteParticipant: RemoteParticipant) {
        val remoteParticipantIdentity = remoteParticipant.identity
        val args = Bundle()
        args.putString("action", "disconnected")
        args.putString("participantIdentity", remoteParticipantIdentity)
        videoCallController.sendEvent("participantRoomConnectionEvent", args)
        Log.d(TAG, "Participant " + remoteParticipantIdentity + " disconnected from " + room.name)
    }

    override fun onRecordingStarted(room: Room) {
        Log.d(TAG, "Recording started on " + room.name)
    }

    override fun onRecordingStopped(room: Room) {
        Log.d(TAG, "Recording stopped on " + room.name)
    }

    companion object {
        private const val TAG = "TwilioRoomListener"
    }
}