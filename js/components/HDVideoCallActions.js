import _ from "lodash";
import React from "react";
import {Animated, Dimensions, Pressable, Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {activeCallManager} from "../../index";
import {hdVideoEvents} from "./native";

export default function HDVideoCallActions(props) {
    const [areControlsHidden, setAreControlsHidden] = React.useState(false);
    const [isLocalVideoEnabled, setIsLocalVideoEnabled] = React.useState(true);
    const [isLocalAudioEnabled, setIsLocalAudioEnabled] = React.useState(true);
    const [didRemoteParticipantDisconnect, setDidRemoteParticipantDisconnect] = React.useState(false);
    const [currentCameraDirection, setCurrentCameraDirection] = React.useState("front");
    const [videoCallStatus, setVideoCallStatus] = React.useState(props.videoCallStatus);

    const toggleLocalVideoStateIconName = isLocalVideoEnabled ? "videocam-outline" : "videocam-off-outline";
    const toggleLocalAudioStateIconName = isLocalAudioEnabled ? "mic-outline" : "mic-off-outline";

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
                <View style={{position: "absolute", height: props.size, width: props.size, borderRadius: props.size, backgroundColor: props.color || "#444444", opacity: 0.4}}/>
                <Icon name={props.icon} size={32} color={"white"} style={props.iconStyle}/>
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
                    <ToggleAction onPress={props.onEndCall} disabled={areControlsHidden} size={64} color={"#C52723"} icon={"call-outline"} iconStyle={{transform: [{ rotate: "135deg"}]}}/>
                    <ToggleAction onPress={toggleLocalVideoState} disabled={areControlsHidden} icon={toggleLocalVideoStateIconName}/>
                    <ToggleAction onPress={toggleLocalAudioState} disabled={areControlsHidden} icon={toggleLocalAudioStateIconName}/>
                    <ToggleAction onPress={flipCameraDirection} disabled={areControlsHidden} icon={"ios-camera-reverse"}/>
                </View>
            </View>
            <Animated.View style={{height: Animated.multiply(controlsOpacity, 64)}}/>
        </Animated.View>
    );

    const LandscapeLayout = () => (
        <Animated.View style={{flex: 1, opacity: controlsOpacity, alignItems: "flex-end"}}>
            <View style={{flex: 1, alignItems: "center", justifyContent: "space-around", backgroundColor: "#000000"}}>
                <TouchableOpacity onPress={toggleLocalVideoState} disabled={areControlsHidden} style={{flex: 1, justifyContent: "center", padding: 12}}>
                    <Icon name={toggleLocalVideoStateIconName} size={42} color={"white"}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleLocalAudioState} disabled={areControlsHidden} style={{flex: 1, justifyContent: "center", padding: 12}}>
                    <Icon name={toggleLocalAudioStateIconName} size={42} color={"white"}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={flipCameraDirection} disabled={areControlsHidden} style={{flex: 1, justifyContent: "center", padding: 12}}>
                    <Icon name={"ios-camera-reverse"} size={42} color={"white"}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={props.onEndCall} disabled={areControlsHidden} style={{flex: 1, justifyContent: "center", padding: 24}}>
                    <View style={{
                        alignItems: "center",
                        justifyContent: "center",
                        height: 64,
                        width: 64,
                        borderRadius: 64,
                        backgroundColor: "#C52723"}}>
                        <Icon name={"phone"} color={"white"} size={40} style={{transform: [{ rotate: "135deg"}]}} />
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
