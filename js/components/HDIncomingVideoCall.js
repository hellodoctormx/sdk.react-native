import React from "react";
import {AppRegistry, RootTagContext, Text, TouchableOpacity, View} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import videoServiceApi from "../api/video";
import * as connectionManager from "../telecom/connectionManager";
import PreviewLocalVideoView from "./PreviewLocalVideoView";
import withVideoCallPermissions from "./withVideoCallPermissions";
import RNHelloDoctor, {eventHandlers} from "../../index";


function HDIncomingVideoCall(props) {
    const {autoAccept} = props;
    const rootTag = React.useContext(RootTagContext);

    console.debug("[HDIncomingVideoCall:RENDER]", {autoAccept, rootTag});
    React.useEffect(() => {
        if (autoAccept) {
            acceptIncomingVideoCall().catch(error => `[IncomingVideoCallScreen:componentDidMount:acceptIncomingVideoCall] ${error}`)
        }
    });

    const CallActionTouchable = props => (
        <View style={{flex: 1, alignItems: "center"}}>
            <TouchableOpacity onPress={props.onPress} style={{backgroundColor: props.color, height: 84, width: 84, borderRadius: 84, alignItems: "center", justifyContent: "center"}}>
                <Icon name={props.icon} size={36} color={"white"}/>
            </TouchableOpacity>
        </View>
    )

    return autoAccept ? <View style={{flex: 1, backgroundColor: "#000000"}}/> : (
        <View style={{flex: 1, backgroundColor: "#0062B2"}}>
            <PreviewLocalVideoView/>
            <View style={{position: "absolute", height: "100%", width: "100%", justifyContent: "flex-end", backgroundColor: "black", opacity: 0.5}}/>
            <View style={{position: "absolute", height: "100%", width: "100%", justifyContent: "flex-end"}}>
                <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                    {/*<ProfilePhoto profile={practitionerProfile}/>*/}
                    <Text style={{fontWeight: "bold", fontSize: 24, color: "white", textAlign: "center"}}>Consulta de HelloDoctor</Text>
                    <Text style={{fontWeight: "normal", fontSize: 20, color: "white", textAlign: "center"}}>Videollamada...</Text>
                </View>
                <View style={{flexDirection: "row", marginBottom: 64, alignItems: "center", justifyContent: "space-between"}}>
                    <CallActionTouchable onPress={() => rejectIncomingVideoCall(rootTag)} icon={"stop"} color={"#C52723"}/>
                    <CallActionTouchable onPress={() => acceptIncomingVideoCall(rootTag)} icon={"videocam"} color={"#10810a"}/>
                </View>
            </View>
        </View>
    );
}

async function acceptIncomingVideoCall(rootTag) {
    console.info("[HDIncomingVideoCall:acceptIncomingVideoCall]");

    AppRegistry.runApplication(RNHelloDoctor.appName, {rootTag});

    const {consultationID, videoRoomSID, status} = connectionManager.getIncomingCall();
    console.info("[HDIncomingVideoCall:acceptIncomingVideoCall] got", {consultationID, videoRoomSID, status});

    const response = await videoServiceApi.requestVideoCallAccess(videoRoomSID);
    console.info("[HDIncomingVideoCall:acceptIncomingVideoCall] response", response);

    const {accessToken} = response;

    eventHandlers.navigateOnAnswerCall(consultationID, videoRoomSID, accessToken);
    connectionManager.handleIncomingVideoCallAnswered(videoRoomSID);
}

async function rejectIncomingVideoCall(rootTag) {
    console.info("[HDIncomingVideoCall:rejectIncomingVideoCall]");

    AppRegistry.runApplication(RNHelloDoctor.appName, {rootTag});

    const incomingCall = connectionManager.getIncomingCall();

    if (incomingCall) {
        connectionManager
            .rejectVideoCall(incomingCall.videoRoomSID)
            .catch(error => console.warn(`[IncomingVideoCallScreen:rejectIncomingVideoCall] error: ${error}`));
    }

    eventHandlers.navigateOnRejectCall();
}

export default withVideoCallPermissions(HDIncomingVideoCall);
