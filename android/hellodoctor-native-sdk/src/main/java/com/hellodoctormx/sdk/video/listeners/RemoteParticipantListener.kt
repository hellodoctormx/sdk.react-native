package com.hellodoctormx.sdk.video.listeners

import android.os.Bundle
import android.util.Log
import com.hellodoctormx.sdk.video.VideoCallController
import com.hellodoctormx.sdk.video.RemoteParticipantView
import com.twilio.video.*

class RemoteParticipantListener internal constructor(private val videoCallController: VideoCallController) :
    RemoteParticipant.Listener {
    private val tag = "RemotePartyListener"
    override fun onAudioTrackPublished(
        remoteParticipant: RemoteParticipant,
        remoteAudioTrackPublication: RemoteAudioTrackPublication
    ) {
        Log.d(tag, "Published audio track for " + remoteParticipant.identity)
    }

    override fun onAudioTrackUnpublished(
        remoteParticipant: RemoteParticipant,
        remoteAudioTrackPublication: RemoteAudioTrackPublication
    ) {
        Log.d(tag, "Unpublished audio track for " + remoteParticipant.identity)
    }

    override fun onAudioTrackSubscribed(
        remoteParticipant: RemoteParticipant,
        remoteAudioTrackPublication: RemoteAudioTrackPublication,
        remoteAudioTrack: RemoteAudioTrack
    ) {
        Log.d(tag, "Subscribed audio track for " + remoteParticipant.identity)
    }

    override fun onAudioTrackSubscriptionFailed(
        remoteParticipant: RemoteParticipant,
        remoteAudioTrackPublication: RemoteAudioTrackPublication,
        twilioException: TwilioException
    ) {
        Log.d(
            tag,
            "Subscribe audio track failed for " + remoteParticipant.identity + ": " + twilioException
        )
    }

    override fun onAudioTrackUnsubscribed(
        remoteParticipant: RemoteParticipant,
        remoteAudioTrackPublication: RemoteAudioTrackPublication,
        remoteAudioTrack: RemoteAudioTrack
    ) {
        Log.d(tag, "Unsubscribed audio track for " + remoteParticipant.identity)
    }

    override fun onVideoTrackPublished(
        remoteParticipant: RemoteParticipant,
        remoteVideoTrackPublication: RemoteVideoTrackPublication
    ) {
        Log.d(tag, "Published video track for " + remoteParticipant.identity)
    }

    override fun onVideoTrackUnpublished(
        remoteParticipant: RemoteParticipant,
        remoteVideoTrackPublication: RemoteVideoTrackPublication
    ) {
        Log.d(tag, "Unpublished video track for " + remoteParticipant.identity)
    }

    override fun onVideoTrackSubscribed(
        participant: RemoteParticipant,
        remoteVideoTrackPublication: RemoteVideoTrackPublication,
        remoteVideoTrack: RemoteVideoTrack
    ) {
        Log.d(tag, "Subscribed video track for " + participant.identity)

        val args = Bundle()
        args.putString("action", "connected")
        args.putString("participantIdentity", participant.identity)
        videoCallController.sendEvent("participantVideoEvent", args)

        val remoteParticipantView = videoCallController.remoteParticipantView
        if (remoteParticipantView != null) {
            videoCallController.renderRemoteParticipant(remoteParticipantView, participant.identity)
        }
    }

    override fun onVideoTrackSubscriptionFailed(
        remoteParticipant: RemoteParticipant,
        remoteVideoTrackPublication: RemoteVideoTrackPublication,
        twilioException: TwilioException
    ) {
        Log.d(
            tag,
            "Failed to subscribe to video track for " + remoteParticipant.identity + ": " + twilioException
        )
    }

    override fun onVideoTrackUnsubscribed(
        remoteParticipant: RemoteParticipant,
        remoteVideoTrackPublication: RemoteVideoTrackPublication,
        remoteVideoTrack: RemoteVideoTrack
    ) {
        Log.d(tag, "Unsubscribed video track for " + remoteParticipant.identity)

        val participantVideoView = videoCallController.remoteParticipantView
        if (participantVideoView != null) {
            remoteVideoTrack.removeSink(participantVideoView)
        }

        val args = Bundle()
        args.putString("action", "disconnected")
        args.putString("participantIdentity", remoteParticipant.identity)
        videoCallController.sendEvent("participantVideoEvent", args)
    }

    override fun onAudioTrackEnabled(
        remoteParticipant: RemoteParticipant,
        remoteAudioTrackPublication: RemoteAudioTrackPublication
    ) {
        Log.d(tag, "Enabled audio track for " + remoteParticipant.identity)
        val args = Bundle()
        args.putString("state", "enabled")
        args.putString("participantIdentity", remoteParticipant.identity)
        videoCallController.sendEvent("participantAudioEvent", args)
    }

    override fun onAudioTrackDisabled(
        remoteParticipant: RemoteParticipant,
        remoteAudioTrackPublication: RemoteAudioTrackPublication
    ) {
        Log.d(tag, "Disabled audio track for " + remoteParticipant.identity)
        val args = Bundle()
        args.putString("state", "disabled")
        args.putString("participantIdentity", remoteParticipant.identity)
        videoCallController.sendEvent("participantAudioEvent", args)
    }

    override fun onVideoTrackEnabled(
        remoteParticipant: RemoteParticipant,
        remoteVideoTrackPublication: RemoteVideoTrackPublication
    ) {
        Log.d(tag, "Enabled video track for " + remoteParticipant.identity)
        Log.d(tag, "IS ENABLED " + remoteVideoTrackPublication.isTrackEnabled)
        Log.d(tag, "IS SUBSCRIBED " + remoteVideoTrackPublication.isTrackSubscribed)
        val args = Bundle()
        args.putString("state", "enabled")
        args.putString("participantIdentity", remoteParticipant.identity)
        videoCallController.sendEvent("participantVideoEvent", args)
    }

    override fun onVideoTrackDisabled(
        remoteParticipant: RemoteParticipant,
        remoteVideoTrackPublication: RemoteVideoTrackPublication
    ) {
        Log.d(tag, "Disabled video track for " + remoteParticipant.identity)
        val args = Bundle()
        args.putString("state", "disabled")
        args.putString("participantIdentity", remoteParticipant.identity)
        videoCallController.sendEvent("participantVideoEvent", args)
    }

    override fun onDataTrackPublished(
        remoteParticipant: RemoteParticipant,
        remoteDataTrackPublication: RemoteDataTrackPublication
    ) {
    }

    override fun onDataTrackUnpublished(
        remoteParticipant: RemoteParticipant,
        remoteDataTrackPublication: RemoteDataTrackPublication
    ) {
    }

    override fun onDataTrackSubscribed(
        remoteParticipant: RemoteParticipant,
        remoteDataTrackPublication: RemoteDataTrackPublication,
        remoteDataTrack: RemoteDataTrack
    ) {
    }

    override fun onDataTrackSubscriptionFailed(
        remoteParticipant: RemoteParticipant,
        remoteDataTrackPublication: RemoteDataTrackPublication,
        twilioException: TwilioException
    ) {
    }

    override fun onDataTrackUnsubscribed(
        remoteParticipant: RemoteParticipant,
        remoteDataTrackPublication: RemoteDataTrackPublication,
        remoteDataTrack: RemoteDataTrack
    ) {
    }
}