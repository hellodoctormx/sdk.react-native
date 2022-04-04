import React from "react";
import HDVideoCallView from "./HDVideoCallView";
import {LocalVideoView} from "./native";
import {getActiveCall, getIncomingCall} from "../telecom/connectionManager";
import {navigateOnEndCall} from "../telecom/eventHandlers";
import videoServiceApi from "../api/video";

export default function HDVideoCall(props) {
    const [videoRoomSID, setVideoRoomSID] = React.useState(props.videoRoomSID);
    const [consultationID, setConsultationID] = React.useState(props.consultationID);
    const [accessToken, setAccessToken] = React.useState(props.accessToken);

    React.useEffect(() => {
        doBootstrapCall();
    }, []);

    React.useEffect(() => {
        if (videoRoomSID && !accessToken) {
            doRequestAccessToken();
        }
    }, [videoRoomSID]);

    function doBootstrapCall() {
        if (!videoRoomSID) {
            // This call is being answered from a notification, and thus won't have the props set
            const incomingCall = getIncomingCall();

            if (!incomingCall) {
                console.warn("[HDVideoCall:doBootstrapCall] no incoming call found");
                navigateOnEndCall();
                return;
            }

            setVideoRoomSID(incomingCall.videoRoomSID);
            setConsultationID(incomingCall.consultationID);
        }
    }

    function doRequestAccessToken() {
        videoServiceApi
            .requestVideoCallAccess(videoRoomSID)
            .then(({accessToken}) => setAccessToken(accessToken))
            .catch(error => {
                console.warn("[HDVideoCall:doRequestAccessToken] aborting call due to error:", error);
                navigateOnEndCall()
            });
    }

    return (
        <React.Fragment>
            {!accessToken && <LocalVideoView style={{width: "100%", height: "100%"}}/>}
            {accessToken && <HDVideoCallView videoRoomSID={videoRoomSID} consultationID={consultationID} accessToken={accessToken}/>}
        </React.Fragment>
    )
}
