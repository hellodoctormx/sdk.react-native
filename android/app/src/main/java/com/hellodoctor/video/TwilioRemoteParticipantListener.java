package com.hellodoctor.video;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.twilio.video.RemoteAudioTrack;
import com.twilio.video.RemoteAudioTrackPublication;
import com.twilio.video.RemoteDataTrack;
import com.twilio.video.RemoteDataTrackPublication;
import com.twilio.video.RemoteParticipant;
import com.twilio.video.RemoteVideoTrack;
import com.twilio.video.RemoteVideoTrackPublication;
import com.twilio.video.TwilioException;
import com.twilio.video.VideoView;


public class TwilioRemoteParticipantListener implements RemoteParticipant.Listener {
    private String TAG = "TwilioRemoteParticipantListener";

    private com.hellodoctor.video.HDVideo mTwilioVideo;

    TwilioRemoteParticipantListener(com.hellodoctor.video.HDVideo twilioVideo) {
        mTwilioVideo = twilioVideo;
    }

    @Override
    public void onAudioTrackPublished(RemoteParticipant remoteParticipant, RemoteAudioTrackPublication remoteAudioTrackPublication) {
        Log.d(TAG, "Published audio track for " + remoteParticipant.getIdentity());
    }

    @Override
    public void onAudioTrackUnpublished(RemoteParticipant remoteParticipant, RemoteAudioTrackPublication remoteAudioTrackPublication) {
        Log.d(TAG, "Unpublished audio track for " + remoteParticipant.getIdentity());
    }

    @Override
    public void onAudioTrackSubscribed(RemoteParticipant remoteParticipant, RemoteAudioTrackPublication remoteAudioTrackPublication, RemoteAudioTrack remoteAudioTrack) {
        Log.d(TAG, "Subscribed audio track for " + remoteParticipant.getIdentity());
    }

    @Override
    public void onAudioTrackSubscriptionFailed(RemoteParticipant remoteParticipant, RemoteAudioTrackPublication remoteAudioTrackPublication, TwilioException twilioException) {
        Log.d(TAG, "Subscribe audio track failed for " + remoteParticipant.getIdentity() + ": " + twilioException);
    }

    @Override
    public void onAudioTrackUnsubscribed(RemoteParticipant remoteParticipant, RemoteAudioTrackPublication remoteAudioTrackPublication, RemoteAudioTrack remoteAudioTrack) {
        Log.d(TAG, "Unsubscribed audio track for " + remoteParticipant.getIdentity());
    }

    @Override
    public void onVideoTrackPublished(RemoteParticipant remoteParticipant, RemoteVideoTrackPublication remoteVideoTrackPublication) {
        Log.d(TAG, "Published video track for " + remoteParticipant.getIdentity());
    }

    @Override
    public void onVideoTrackUnpublished(RemoteParticipant remoteParticipant, RemoteVideoTrackPublication remoteVideoTrackPublication) {
        Log.d(TAG, "Unpublished video track for " + remoteParticipant.getIdentity());
    }

    @Override
    public void onVideoTrackSubscribed(RemoteParticipant participant, @NonNull RemoteVideoTrackPublication remoteVideoTrackPublication, @NonNull RemoteVideoTrack remoteVideoTrack) {
        Log.d(TAG, "Subscribed video track for " + participant.getIdentity());

        WritableMap args = Arguments.createMap();
        args.putString("action", "connected");
        args.putString("participantIdentity", participant.getIdentity());

        mTwilioVideo.sendEvent("participantVideoEvent", args);

        VideoView remoteParticipantView = mTwilioVideo.getParticipantVideoView(participant.getIdentity());

        if (remoteParticipantView != null) {
            mTwilioVideo.tryRenderRemoteParticipant(remoteParticipantView, participant.getIdentity());
        }
    }

    @Override
    public void onVideoTrackSubscriptionFailed(RemoteParticipant remoteParticipant, RemoteVideoTrackPublication remoteVideoTrackPublication, TwilioException twilioException) {
        Log.d(TAG, "Failed to subscribe to video track for " + remoteParticipant.getIdentity() + ": " + twilioException);
    }

    @Override
    public void onVideoTrackUnsubscribed(RemoteParticipant remoteParticipant, RemoteVideoTrackPublication remoteVideoTrackPublication, RemoteVideoTrack remoteVideoTrack) {
        Log.d(TAG, "Unsubscribed video track for " + remoteParticipant.getIdentity());

        HDVideoRemoteView participantVideoView = mTwilioVideo.getParticipantVideoView(remoteParticipant.getIdentity());

        if (participantVideoView != null) {
            remoteVideoTrack.removeSink(participantVideoView);
        }

        WritableMap args = Arguments.createMap();
        args.putString("action", "disconnected");
        args.putString("participantIdentity", remoteParticipant.getIdentity());

        mTwilioVideo.sendEvent("participantVideoEvent", args);
    }

    @Override
    public void onAudioTrackEnabled(RemoteParticipant remoteParticipant, RemoteAudioTrackPublication remoteAudioTrackPublication) {
        Log.d(TAG, "Enabled audio track for " + remoteParticipant.getIdentity());

        WritableMap args = Arguments.createMap();
        args.putString("state", "enabled");
        args.putString("participantIdentity", remoteParticipant.getIdentity());

        mTwilioVideo.sendEvent("participantAudioEvent", args);
    }

    @Override
    public void onAudioTrackDisabled(RemoteParticipant remoteParticipant, RemoteAudioTrackPublication remoteAudioTrackPublication) {
        Log.d(TAG, "Disabled audio track for " + remoteParticipant.getIdentity());

        WritableMap args = Arguments.createMap();
        args.putString("state", "disabled");
        args.putString("participantIdentity", remoteParticipant.getIdentity());

        mTwilioVideo.sendEvent("participantAudioEvent", args);
    }

    @Override
    public void onVideoTrackEnabled(RemoteParticipant remoteParticipant, RemoteVideoTrackPublication remoteVideoTrackPublication) {
        Log.d(TAG, "Enabled video track for " + remoteParticipant.getIdentity());
        Log.d(TAG, "IS ENABLED " + remoteVideoTrackPublication.isTrackEnabled());
        Log.d(TAG, "IS SUBSCRIBED " + remoteVideoTrackPublication.isTrackSubscribed());

        WritableMap args = Arguments.createMap();
        args.putString("state", "enabled");
        args.putString("participantIdentity", remoteParticipant.getIdentity());

        mTwilioVideo.sendEvent("participantVideoEvent", args);
    }

    @Override
    public void onVideoTrackDisabled(RemoteParticipant remoteParticipant, RemoteVideoTrackPublication remoteVideoTrackPublication) {
        Log.d(TAG, "Disabled video track for " + remoteParticipant.getIdentity());

        WritableMap args = Arguments.createMap();
        args.putString("state", "disabled");
        args.putString("participantIdentity", remoteParticipant.getIdentity());

        mTwilioVideo.sendEvent("participantVideoEvent", args);
    }

    @Override
    public void onDataTrackPublished(@NonNull RemoteParticipant remoteParticipant, @NonNull RemoteDataTrackPublication remoteDataTrackPublication) {

    }

    @Override
    public void onDataTrackUnpublished(@NonNull RemoteParticipant remoteParticipant, @NonNull RemoteDataTrackPublication remoteDataTrackPublication) {

    }

    @Override
    public void onDataTrackSubscribed(@NonNull RemoteParticipant remoteParticipant, @NonNull RemoteDataTrackPublication remoteDataTrackPublication, @NonNull RemoteDataTrack remoteDataTrack) {

    }

    @Override
    public void onDataTrackSubscriptionFailed(@NonNull RemoteParticipant remoteParticipant, @NonNull RemoteDataTrackPublication remoteDataTrackPublication, @NonNull TwilioException twilioException) {

    }

    @Override
    public void onDataTrackUnsubscribed(@NonNull RemoteParticipant remoteParticipant, @NonNull RemoteDataTrackPublication remoteDataTrackPublication, @NonNull RemoteDataTrack remoteDataTrack) {

    }
}
