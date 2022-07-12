import _ from "lodash";
import React, {useEffect, useRef, useState} from "react";
import {Animated, Dimensions, Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import * as activeCallManager from "../telecom/activeCallManager";
import {hdEventEmitter} from "./native";
import {alpha} from "../utils/colors";

export default function HDVideoCallActions(props) {
    const [areControlsHidden, setAreControlsHidden] = useState(false);
    const [isLocalVideoEnabled, setIsLocalVideoEnabled] = useState(true);
    const [isLocalAudioEnabled, setIsLocalAudioEnabled] = useState(true);
    const [didRemoteParticipantDisconnect, setDidRemoteParticipantDisconnect] = useState(false);
    const [currentCameraDirection, setCurrentCameraDirection] = useState("front");
    const [videoCallStatus, setVideoCallStatus] = useState(props.videoCallStatus);

    const toggleLocalVideoStateIconName = isLocalVideoEnabled ? "videocam" : "videocam-outline";
    const toggleLocalAudioStateIconName = isLocalAudioEnabled ? "mic" : "mic-off-outline";

    const automaticCloseHandleRef = useRef(0);
    const controlsOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() =>  {
        const connectedToRoomListener = hdEventEmitter.addListener("connectedToRoom", event => {
            const videoCallStatus = _.isEmpty(event.participants) ? "waiting" : "in-progress";

            setVideoCallStatus(videoCallStatus);

            setTimeout(hideControls, 6000);
        });

        const participantConnectionEventListener = hdEventEmitter.addListener("participantRoomConnectionEvent", event => {
            if (event.action === "connected") {
                setVideoCallStatus("in-progress");
                setDidRemoteParticipantDisconnect(false);
            } else if (event.action === "disconnected") {
                setVideoCallStatus("disconnected");
                setDidRemoteParticipantDisconnect(true);
            }
        });

        return () => {
            connectedToRoomListener.remove();
            participantConnectionEventListener.remove();
        }
    });

    async function flipCameraDirection() {
        await activeCallManager.flipCamera();

        setCurrentCameraDirection(currentCameraDirection === "back" ? "front" : "back");
    }

    function toggleLocalVideoState() {
        activeCallManager.setLocalVideoEnabled(!isLocalVideoEnabled);
        setIsLocalVideoEnabled(!isLocalVideoEnabled)
    }

    async function toggleLocalAudioState() {
        activeCallManager.setLocalAudioEnabled(!isLocalAudioEnabled);
        setIsLocalAudioEnabled(!isLocalAudioEnabled);
    }

    function showControls() {
        clearTimeout(automaticCloseHandleRef.current);

        setAreControlsHidden(false);

        Animated.timing(controlsOpacity, {toValue: 1, duration: 300, useNativeDriver: false}).start();

        automaticCloseHandleRef.current = setTimeout(hideControls, 4000);
    }

    function hideControls() {
        clearTimeout(automaticCloseHandleRef.current);

        setAreControlsHidden(true);

        Animated.timing(controlsOpacity, {toValue: 0, duration: 300, useNativeDriver: false}).start();
    }

    const toggleControls = () => {
        if (areControlsHidden) {
            showControls();
        } else {
            hideControls();
        }
    }

    const {height: screenHeight, width: screenWidth} = Dimensions.get("screen");

    return (
        <TouchableWithoutFeedback onPress={toggleControls} style={{zIndex: 2, elevation: 3, position: "absolute"}}>
            <View style={{zIndex: 100, width: screenWidth, height: screenHeight}}>
                <Animated.View style={{flex: 1, opacity: controlsOpacity, justifyContent: "flex-end"}}>
                    {didRemoteParticipantDisconnect && (
                        <View style={{marginBottom: 48, padding: 24, margin: 12, backgroundColor: "#000000", opacity: 0.6, borderRadius: 48}}>
                            <Text style={{fontSize: 20, color: "white", textAlign: "center"}}>Tu doctor se ha desconectado</Text>
                        </View>
                    )}
                    <View style={{padding: 18, backgroundColor: alpha("#000000", 0.8), borderRadius: 64, margin: 18}}>
                        <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-around"}}>
                            <ToggleAction onPress={props.onEndCall} disabled={areControlsHidden} size={64} color={"#C52723"} icon={"call"} iconStyle={{transform: [{ rotate: "135deg"}]}}/>
                            <ToggleAction onPress={toggleLocalVideoState} disabled={areControlsHidden} size={54} icon={toggleLocalVideoStateIconName}/>
                            <ToggleAction onPress={toggleLocalAudioState} disabled={areControlsHidden} size={54} icon={toggleLocalAudioStateIconName}/>
                            <ToggleAction onPress={flipCameraDirection} disabled={areControlsHidden} size={54} icon={"ios-camera-reverse"}/>
                        </View>
                    </View>
                    <Animated.View style={{height: Animated.multiply(controlsOpacity, 64)}}/>
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const ToggleAction = props => (
    <View style={{margin: 12}}>
        <TouchableOpacity onPress={props.onPress} disabled={props.disabled} style={{height: props.size, width: props.size, borderRadius: props.size, alignItems: "center", justifyContent: "center"}}>
            <View style={{position: "absolute", height: props.size, width: props.size, borderRadius: props.size, backgroundColor: props.color || alpha("#444444", 0.9)}}/>
            <Icon name={props.icon} size={32} color={"white"} style={props.iconStyle} solid={true}/>
        </TouchableOpacity>
    </View>
);
