import _ from "lodash";
import React, {useEffect, useRef, useState} from "react";
import {Animated, Dimensions, Platform, Text, View} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import withVideoCallPermissions from "./withVideoCallPermissions";
import HDVideoCallActions from "./HDVideoCallActions";
import {hdVideoEvents, LocalVideoView, RemoteVideoView} from "./native";
import * as activeCallManager from "../telecom/activeCallManager";
import * as connectionManager from "../telecom/connectionManager";


export default function HDVideoCallView(props) {
    const {consultationID, videoRoomSID, accessToken} = props;

    const [remoteParticipantSID, setRemoteParticipantSID] = React.useState();
    const [remoteVideoState, setRemoteVideoState] = React.useState();
    const [remoteAudioState, setRemoteAudioState] = React.useState();

    const accessTokenRef = React.useRef("");
    const participantsRef = React.useRef([]);

    const {height: screenHeight, width: screenWidth} = Dimensions.get("screen");

    const localVideoWidthRef = React.useRef(new Animated.Value(screenWidth));
    const localVideoHeightRef = React.useRef(new Animated.Value(screenHeight));
    const localVideoBottomRef = React.useRef(new Animated.Value(0));
    const localVideoLeftRef = React.useRef(new Animated.Value(0));

    const aspectRatio = 1.4;
    const insetVideoHeight = screenHeight / 4;
    const insetVideoWidth = insetVideoHeight / aspectRatio;

    const doMinimizeLocalVideoView = () => Animated.parallel([
        Animated.timing(localVideoHeightRef.current, {toValue: insetVideoHeight, useNativeDriver: false}),
        Animated.timing(localVideoWidthRef.current, {toValue: insetVideoWidth, useNativeDriver: false}),
        Animated.timing(localVideoBottomRef.current, {toValue: 12, useNativeDriver: false}),
        Animated.timing(localVideoLeftRef.current, {toValue: 12, useNativeDriver: false}),
    ]).start();

    const doMaximizeLocalVideoView = () => Animated.parallel([
        Animated.timing(localVideoHeightRef.current, {toValue: screenHeight, useNativeDriver: false}),
        Animated.timing(localVideoWidthRef.current, {toValue: screenWidth, useNativeDriver: false}),
        Animated.timing(localVideoBottomRef.current, {toValue: 0, useNativeDriver: false}),
        Animated.timing(localVideoLeftRef.current, {toValue: 0, useNativeDriver: false}),
    ]).start();

    const RemoteParticipantStateOverlay = () => {
        const videoStateOpacity = remoteVideoState === "disabled" ? 1 : 0;
        const audioStateOpacity = remoteAudioState === "disabled" ? 1 : 0;

        return (
            <View style={{position: "absolute", height: screenHeight, width: screenWidth, backgroundColor: "transparent"}}>
                <View style={{flex: 1, justifyContent: "center", alignItems: "center", opacity: videoStateOpacity}}>
                    <Icon name={"video-off"} size={48} color={"white"} solid={true}/>
                    <Text style={{fontSize: 24, color: "white", marginTop: 24}}>
                        Video en pausa
                    </Text>
                </View>
                <View style={{position: "absolute", bottom: 84, right: 12, opacity: audioStateOpacity}}>
                    <Icon name={"microphone-off"} color={"#C52723"} size={32}/>
                </View>
            </View>
        )
    };

    const didRenderRemoteParticipantRef = useRef(false);
    const renderAttemptsRef = useRef(0);
    const remoteParticipantRenderCheckTimeoutRef = useRef(0);

    const doSetRemoteParticipantSID = remoteParticipantSID => {
        didRenderRemoteParticipantRef.current = false;

        setRemoteParticipantSID(remoteParticipantSID);

        clearTimeout(remoteParticipantRenderCheckTimeoutRef.current);

        remoteParticipantRenderCheckTimeoutRef.current = setTimeout(() => {
            if (Platform.OS !== "ios") {
                return;
            }

            // FIXME This section is some hacky shit for iOS to try to re-render practitioner video that for
            // whatever reason was not appearing as "published" at the time of connection. Which is bullshit. But whatever
            // this works for now.
            if (!didRenderRemoteParticipantRef.current && renderAttemptsRef.current < 10) {
                console.info("[HDVideoCallView:doSetRemoteParticipantSID:RETRYING]", renderAttemptsRef.current);
                renderAttemptsRef.current = renderAttemptsRef.current + 1;
                setRemoteParticipantSID();
                setTimeout(() => doSetRemoteParticipantSID(remoteParticipantSID), 500);
            }
        }, 1000);
    }

    const handleConnectedToRoomEvent = event => {
        console.info("[handleConnectedToRoomEvent]", event);

        // remoteParticipantIdentity may be undefined if local participant is first to connect
        const {participants} = event;

        participantsRef.current = participants;

        const remoteParticipantIdentity = _.first(participants);

        if (remoteParticipantIdentity) {
            doMinimizeLocalVideoView();
            doSetRemoteParticipantSID(remoteParticipantIdentity);
        }
    }

    const handleParticipantDisconnectedEvent = participantIdentity => {
        console.info(`[handleParticipantDisconnectedEvent:${participantIdentity}]`, participantsRef.current);

        participantsRef.current = participantsRef.current.filter(p => p !== participantIdentity);

        const remoteParticipantIdentity = _.first(participantsRef.current);

        if (remoteParticipantIdentity) {
            doMinimizeLocalVideoView();
            doSetRemoteParticipantSID(remoteParticipantIdentity);
        } else {
            doMaximizeLocalVideoView();
        }
    }

    const handleParticipantRoomConnectionEvent = event => {
        console.info("[handleParticipantRoomConnectionEvent]", event);

        const {action, participantIdentity} = event;

        switch (action) {
            case "disconnected":
                handleParticipantDisconnectedEvent(participantIdentity);
                break;
        }
    }

    const handleParticipantVideoEvent = event => {
        console.info("[handleParticipantVideoEvent]", event);

        const {participantIdentity} = event;

        const handleParticipantConnectedEvent = () => {
            participantsRef.current = _.uniq([...participantsRef.current, participantIdentity]);
            doSetRemoteParticipantSID(participantIdentity);
            doMinimizeLocalVideoView();
        }

        switch (event.action) {
            case "connected":
            case "published":
            case "subscribed":
                handleParticipantConnectedEvent();
                break;
            case "disconnected":
            case "unpublished":
            case "unsubscribed":
                handleParticipantDisconnectedEvent(participantIdentity);
                break;
            case "disabledVideo":
                setRemoteVideoState("disabled");
                break;
            case "enabledVideo":
                setRemoteVideoState("enabled");
                break;
            case "renderedParticipant":
                // TODO handle timing so that remoteParticipantSID is ready
                didRenderRemoteParticipantRef.current = true; // event.participantIdentity === remoteParticipantSID;
                break;
        }
    }

    const handleParticipantAudioEvent = event => {
        console.info("[handleParticipantAudioEvent]", event);

        switch (event.action) {
            case "disabledAudio":
                setRemoteAudioState("disabled");
                break;
            default:
                setRemoteAudioState("enabled");
                break;
        }
    }

    React.useEffect(() => {
        console.info(`[VideoCallModal:MOUNT]`, {videoRoomSID});

        const connectedToRoomListener = hdVideoEvents.addListener("connectedToRoom", handleConnectedToRoomEvent);

        const participantRoomConnectionEventListener = hdVideoEvents.addListener(
            "participantRoomConnectionEvent",
            handleParticipantRoomConnectionEvent
        );

        const participantVideoEventListener = hdVideoEvents.addListener(
            "participantVideoEvent",
            handleParticipantVideoEvent
        );

        const participantAudioEventListener = hdVideoEvents.addListener(
            "participantAudioEvent",
            handleParticipantAudioEvent
        );

        connectionManager.handleIncomingVideoCallStarted(videoRoomSID);

        return () => {
            console.info("[VideoCallModal] removed connectedToRoomListener")
            connectedToRoomListener.remove();
            participantRoomConnectionEventListener.remove();
            participantVideoEventListener.remove();
            participantAudioEventListener.remove();

            clearTimeout(remoteParticipantRenderCheckTimeoutRef.current);

            activeCallManager
                .disconnect()
                .catch(error => console.warn(`error disconnecting from video room ${videoRoomSID}: ${JSON.stringify(error)}`))
        }
    }, []);

    const tryConnect = () => {
        console.info("[HDVideoCallRenderer:tryConnect]");

        if (!accessToken) {
            console.info("can't connect video call: no access token available yet");
            return;
        }

        accessTokenRef.current = accessToken;

        activeCallManager
            .connect(videoRoomSID, accessToken)
            .catch(error => console.warn(`error connecting to video room ${videoRoomSID}: ${JSON.stringify(error)}`))
    }

    React.useEffect(() => {
        // Ok this is kinda bullshit but basically - at least on iOS - the LocalVideoView can sometimes take longer than
        // a render cycle before it's ready to be used, which HDVideo.connect expects the LocalVideoView to be ready.
        // Adding this small timeout as a stop-gap measure to allow the LocalVideoView time to get ready.
        // TODO A better way to order the sequence of events necessary for a video call
        // setTimeout(tryConnect, 200);
        if (accessToken) {
            tryConnect()
        }
    }, [accessToken])

    const videoCallStatus = !remoteParticipantSID ? "waiting" : "in-progress";

    const handleOnEndCall = async () => {
        if (props.onEndCall) {
            props.onEndCall(consultationID, videoRoomSID);
        }

        await connectionManager.endVideoCall(videoRoomSID);
    }

    return (
        <View style={{flex: 1}}>
            <View style={{flex: 1, backgroundColor: "black"}}>
                <View>
                    <RemoteVideoView participantSID={remoteParticipantSID} style={{height: "100%", width: "100%"}}/>
                    <RemoteParticipantStateOverlay/>
                </View>
                <Animated.View style={{
                    position: "absolute",
                    width: localVideoWidthRef.current,
                    height: localVideoHeightRef.current,
                    bottom: localVideoBottomRef.current,
                    left: localVideoLeftRef.current,
                    borderRadius: 2,
                    backgroundColor: "#000000",
                    shadowOffset: {height: 1, width: 1},
                    shadowColor: "black",
                    shadowRadius: 3,
                    shadowOpacity: 0.5,
                    padding: 2}}>
                    <LocalVideoView style={{width: "100%", height: "100%"}}/>
                </Animated.View>
            </View>
            <View style={{position: "absolute", height: screenHeight, width: screenWidth}}>
                <HDVideoCallActions
                    onEndCall={handleOnEndCall}
                    videoRoomSID={videoRoomSID}
                    videoCallStatus={videoCallStatus}
                />
            </View>
        </View>
    )
}

// export default withVideoCallPermissions(HDVideoCallView);
