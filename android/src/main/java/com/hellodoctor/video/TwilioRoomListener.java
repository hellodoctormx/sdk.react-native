package com.hellodoctor.video;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.twilio.video.RemoteParticipant;
import com.twilio.video.Room;
import com.twilio.video.TwilioException;

public class TwilioRoomListener implements Room.Listener {
    private final HDVideo hdVideo;

    private static final String TAG = "TwilioRoomListener";

    TwilioRoomListener(HDVideo twilioVideo) {
        hdVideo = twilioVideo;
    }

    @Override
    public void onConnected(Room room) {
        Log.d(TAG, "Connected to " + room.getName());

        /*
        UIApplication.shared.isIdleTimerDisabled = true;
         */

        hdVideo.setSpeakerPhone(true);

        WritableArray remoteParticipantIDs = Arguments.createArray();

        for (RemoteParticipant remoteParticipant : room.getRemoteParticipants()) {
            remoteParticipant.setListener(hdVideo.remoteParticipantListener());

            remoteParticipantIDs.pushString(remoteParticipant.getIdentity());
        }

        WritableMap data = Arguments.createMap();
        data.putArray("participants", remoteParticipantIDs);

        hdVideo.sendEvent("connectedToRoom", data);
    }

    @Override
    public void onConnectFailure(Room room, TwilioException twilioException) {
        Log.d(TAG, "Failed to connect to " + room.getName() + ": " + twilioException);
    }

    @Override
    public void onReconnecting(@NonNull Room room, @NonNull TwilioException twilioException) {
        Log.d(TAG, "Reconnecting to " + room.getName() + ": " + twilioException);
    }

    @Override
    public void onReconnected(@NonNull Room room) {
        Log.d(TAG, "Reconnected to " + room.getName());
    }

    @Override
    public void onDisconnected(Room room, TwilioException twilioException) {
        Log.d(TAG, "Disconnected from " + room.getName() + ": " + twilioException);
    }

    @Override
    public void onParticipantConnected(Room room, RemoteParticipant remoteParticipant) {
        String remoteParticipantIdentity = remoteParticipant.getIdentity();

        WritableMap args = Arguments.createMap();
        args.putString("action", "connected");
        args.putString("participantIdentity", remoteParticipantIdentity);

        hdVideo.sendEvent("participantRoomConnectionEvent", args);

        Log.d(TAG, "Participant " + remoteParticipantIdentity + " connected to " + room.getName());
        remoteParticipant.setListener(hdVideo.remoteParticipantListener());
    }

    @Override
    public void onParticipantDisconnected(Room room, RemoteParticipant remoteParticipant) {
        String remoteParticipantIdentity = remoteParticipant.getIdentity();

        WritableMap args = Arguments.createMap();
        args.putString("action", "disconnected");
        args.putString("participantIdentity", remoteParticipantIdentity);

        hdVideo.sendEvent("participantRoomConnectionEvent", args);

        Log.d(TAG, "Participant " + remoteParticipantIdentity + " disconnected from " + room.getName());
    }

    @Override
    public void onRecordingStarted(Room room) {
        Log.d(TAG, "Recording started on " + room.getName());
    }

    @Override
    public void onRecordingStopped(Room room) {
        Log.d(TAG, "Recording stopped on " + room.getName());
    }
}
