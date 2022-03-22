import _ from "lodash";
import React from "react";
import {Animated, Dimensions, Pressable, Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import MDIcon from "react-native-vector-icons/MaterialCommunityIcons";
import IOIcon from "react-native-vector-icons/Ionicons";

import {HDVideo, hdVideoEvents} from "../HDVideo";

export default function HDVideoCallActions(props) {
    const [areControlsHidden, setAreControlsHidden] = React.useState(false);
    const [isLocalVideoEnabled, setIsLocalVideoEnabled] = React.useState(true);
    const [isLocalAudioEnabled, setIsLocalAudioEnabled] = React.useState(true);
    const [didRemoteParticipantDisconnect, setDidRemoteParticipantDisconnect] = React.useState(false);
    const [currentCameraDirection, setCurrentCameraDirection] = React.useState("front");
    const [videoCallStatus, setVideoCallStatus] = React.useState(props.videoCallStatus);

    const toggleLocalVideoStateIconName = isLocalVideoEnabled ? "video-outline" : "video-off-outline";
    const toggleLocalAudioStateIconName = isLocalAudioEnabled ? "microphone-outline" : "microphone-off";

    const automaticCloseHandleRef = React.useRef(0);
    const controlsOpacity = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() =>  {
        const connectedToRoomListener = hdVideoEvents.addListener("connectedToRoom", event => {
            const videoCallStatus = _.isEmpty(event.participants) ? "waiting" : "in-progress";

            setVideoCallStatus(videoCallStatus);

            setTimeout(hideControls, 2000);
        });

        const participantConnectionEventListener = hdVideoEvents.addListener("participantRoomConnectionEvent", event => {
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
        await HDVideo.flipCamera();

        setCurrentCameraDirection(currentCameraDirection === "back" ? "front" : "back");
    }

    function toggleLocalVideoState() {
        HDVideo.setLocalVideoEnabled(!isLocalVideoEnabled);
        setIsLocalVideoEnabled(!isLocalVideoEnabled)
    }

    async function toggleLocalAudioState() {
        HDVideo.setLocalAudioEnabled(!isLocalAudioEnabled);
        setIsLocalAudioEnabled(!isLocalAudioEnabled);
    }

    function showControls() {
        clearTimeout(automaticCloseHandleRef.current);

        setAreControlsHidden(false);

        Animated.timing(controlsOpacity, {toValue: 1, duration: 300, useNativeDriver: false}).start();

        automaticCloseHandleRef.current = setTimeout(hideControls, 2000);
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

    const ToggleAction = props => (
        <View style={{margin: 12}}>
            <Pressable onPress={props.onPress} disabled={props.disabled} style={{height: props.size, width: props.size, borderRadius: props.size, alignItems: "center", justifyContent: "center"}}>
                <View style={{position: "absolute", height: props.size, width: props.size, borderRadius: props.size, backgroundColor: "#444444", opacity: 0.4}}/>
                {props.icon && <MDIcon name={props.icon} size={32} color={"white"} style={props.iconStyle}/>}
                {props.ioIcon && <IOIcon name={props.ioIcon} size={32} color={"white"} style={props.iconStyle}/>}
            </Pressable>
        </View>
    );

    const PortraitLayout = () => (
        <Animated.View style={{flex: 1, opacity: controlsOpacity, justifyContent: "flex-end"}}>
            {didRemoteParticipantDisconnect && (
                <View style={{marginBottom: 48, padding: 24, margin: 12, backgroundColor: "#000000", opacity: 0.6, borderRadius: 48}}>
                    <Text style={{fontSize: 20, color: "white", textAlign: "center"}}>Tu doctor se ha desconectado</Text>
                </View>
            )}
            <View style={{padding: 18, backgroundColor: "#000000", borderRadius: 64, margin: 18, opacity: 0.9}}>
                <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-around"}}>
                    <ToggleAction onPress={props.onEndCall} disabled={areControlsHidden} size={64} color={"#C52723"} icon={"phone"} iconStyle={{transform: [{ rotate: "135deg"}]}}/>
                    <ToggleAction onPress={toggleLocalVideoState} disabled={areControlsHidden} icon={toggleLocalVideoStateIconName}/>
                    <ToggleAction onPress={toggleLocalAudioState} disabled={areControlsHidden} icon={toggleLocalAudioStateIconName}/>
                    <ToggleAction onPress={flipCameraDirection} disabled={areControlsHidden} ioIcon={"ios-camera-reverse"}/>
                </View>
            </View>
            <Animated.View style={{height: Animated.multiply(controlsOpacity, 64)}}/>
        </Animated.View>
    );

    const LandscapeLayout = () => (
        <Animated.View style={{flex: 1, opacity: controlsOpacity, alignItems: "flex-end"}}>
            <View style={{flex: 1, alignItems: "center", justifyContent: "space-around", backgroundColor: "#000000"}}>
                <TouchableOpacity onPress={toggleLocalVideoState} disabled={areControlsHidden} style={{flex: 1, justifyContent: "center", padding: 12}}>
                    <MDIcon name={toggleLocalVideoStateIconName} size={42} color={"white"}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleLocalAudioState} disabled={areControlsHidden} style={{flex: 1, justifyContent: "center", padding: 12}}>
                    <MDIcon name={toggleLocalAudioStateIconName} size={42} color={"white"}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={flipCameraDirection} disabled={areControlsHidden} style={{flex: 1, justifyContent: "center", padding: 12}}>
                    <Icon name={"sync"} size={42} color={"white"}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={props.onEndCall} disabled={areControlsHidden} style={{flex: 1, justifyContent: "center", padding: 24}}>
                    <View style={{
                        alignItems: "center",
                        justifyContent: "center",
                        height: 64,
                        width: 64,
                        borderRadius: 64,
                        backgroundColor: "#C52723"}}>
                        <MDIcon name={"phone"} color={"white"} size={40} style={{transform: [{ rotate: "135deg"}]}} />
                    </View>
                </TouchableOpacity>
                <View style={{height: 64}}/>
            </View>
        </Animated.View>
    );

    const {height: screenHeight, width: screenWidth} = Dimensions.get("screen");

    return (
        <TouchableWithoutFeedback onPress={toggleControls} style={{zIndex: 2, elevation: 3, position: "absolute"}}>
            <View style={{zIndex: 100, width: screenWidth, height: screenHeight}}>
                <PortraitLayout layout={"portrait"}/>
                {/*<LayoutDependentView>*/}
                {/*    <LandscapeLayout layout={"landscape"}/>*/}
                {/*</LayoutDependentView>*/}
            </View>
        </TouchableWithoutFeedback>
    );
}
