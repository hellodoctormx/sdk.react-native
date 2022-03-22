import {getIncomingCall, navigateToVideoCall, rejectConsultationVideoCall} from "../services/calls";
import {AppState} from "react-native";
import VideoService from "../services/api";

export async function acceptIncomingVideoCall(consultationID, videoRoomSID) {
    console.info("[calls:acceptIncomingVideoCall]");

    if (!consultationID || !videoRoomSID) {
        const incomingCall = getIncomingCall();

        console.debug("[acceptIncomingVideoCall]", incomingCall);

        consultationID = incomingCall.consultationID;
        videoRoomSID = incomingCall.videoRoomSID;
    }

    console.debug("[calls:acceptIncomingVideoCall} AppState.currentState", AppState.currentState);

    navigateToVideoCall(consultationID, videoRoomSID).catch(error => console.warn(`[notifications:acceptIncomingVideoCall:navigateToCall:ERROR] ${error}`));

    if (AppState.currentState !== "active") {
        const response = await VideoService.requestConsultationVideoCallAccess(consultationID, videoRoomSID);

        const {accessToken} = response;

        // setInitialNavigation("VideoCallStack",  {consultationID, videoRoomSID, accessToken});
    }
}

export async function rejectIncomingVideoCall() {
    console.info("[calls:rejectIncomingVideoCall]");

    const incomingCall = getIncomingCall();

    if (!incomingCall) {
        console.info("cannot reject incoming call: none found");
        return;
    }

    rejectConsultationVideoCall(incomingCall.videoRoomSID).catch(console.warn);
}
