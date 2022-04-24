import uuid from "react-native-uuid-generator";
import _ from "lodash";
import {AppState, Platform, Vibration} from "react-native";
import notifee from "@notifee/react-native";
import RNCallKeep from "../callkeep";
import VideoService from "../api/video";
import * as activeCallManager from "./activeCallManager";
import * as connectionService from "./connectionService";
import {getIncomingCallNotification, getOngoingCallNotification} from "./notifications";
import {navigateOnEndCall, tryNavigateOnIncomingCall} from "./eventHandlers";

const calls = [];
const callListeners = [];

const getNewCallUUID = async () => {
    const callUUID = await uuid.getRandomUUID();
    // have to toLowerCase because CallKeep internally lower cases that shit for whatever reason
    return callUUID.toLowerCase();
}

export function getVideoCallStatus(videoRoomSID) {
    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    return call?.status;
}

export function getCallByUUID(callUUID) {
    return calls.find(c => c.uuid === callUUID);
}

export function getActiveCall() {
    return _.find(calls, c => c.status === "in-progress");
}

export function getIncomingCall() {
    return _.find(calls, c => c.status === "incoming") || getActiveCall();
}

export function registerCallStatusListener(videoRoomSID, listener) {
    callListeners.push({videoRoomSID, listener});

    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (call) {
        listener(call.status);
    }
}

function notifyCallStatusListeners(videoRoomSID, status) {
    callListeners.filter(l => l.videoRoomSID === videoRoomSID).forEach(l => l.listener(status));
}

export async function registerIncomingVideoCall(uuid, videoRoomSID, consultationID, caller) {
    const call = {
        uuid: uuid || await getNewCallUUID(),
        videoRoomSID,
        consultationID,
        caller,
        status: "incoming",
        isCallMuted: false,
        isCallHeld: false
    };

    calls.push(call);

    notifyCallStatusListeners(videoRoomSID, call.status);

    return call;
}

export async function notifyIncomingCall(incomingCall) {
    // FIXME only skip iOS if PushKit not setup. So figure out how to determine that
    if (Platform.OS === "ios") {
        // PushKit calls RNCallKeep natively in iOS to display incoming calls
        return;
    }

    const {videoRoomSID, consultationID, caller} = incomingCall;

    if (Platform.OS === "android") {
        console.info(`[handleIncomingVideoCall:notification] displaying incoming call notification ${videoRoomSID}:${incomingCall.uuid} | appState: ${AppState.currentState}`);

        tryNavigateOnIncomingCall(consultationID, videoRoomSID);

        await activeCallManager.startNotificationAlerts();

        const incomingCallNotification = await getIncomingCallNotification(consultationID, videoRoomSID);

        incomingCallNotificationIDs[videoRoomSID] = await notifee
            .displayNotification(incomingCallNotification)
            .catch(error => console.warn(`error displaying incoming call notification`, error));
    } else {
        console.info(`[notifyIncomingCall:CallKeep] displaying incoming call ${videoRoomSID}:${incomingCall.uuid} | appState: ${AppState.currentState}`);

        RNCallKeep.displayIncomingCall(incomingCall.uuid, "HelloDoctor", caller.displayName || "HelloDoctor", "generic", true);

    }

    console.info(`[handleIncomingVideoCall] displayed`);
}

export function handleIncomingVideoCallStarted(videoRoomSID) {
    console.info(`[handleIncomingVideoCallStarted] videoRoomSID: ${videoRoomSID}`, videoRoomSID);

    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (!call) {
        console.warn(`[handleIncomingVideoCallStarted] cannot start ${videoRoomSID}: no call found`);
        return;
    }

    call.status = "in-progress";

    tryCancelVideoCallNotification(videoRoomSID);
}

export function handleIncomingVideoCallAnswered(videoRoomSID) {
    console.info(`[handleIncomingVideoCallAnswered] videoRoomSID: ${videoRoomSID}`, videoRoomSID);

    // FIXME I don't think this try/catch is the best
    try {
        activeCallManager.stopNotificationAlerts();

        const call = calls.find(c => c.videoRoomSID === videoRoomSID);

        call.status = "in-progress";

        tryCancelVideoCallNotification(videoRoomSID);
    } catch(error) {
        console.warn("WTF", error)
    }
}

const incomingCallNotificationIDs = {};

export function tryCancelVideoCallNotification(videoRoomSID) {
    const incomingCallNotificationID = incomingCallNotificationIDs[videoRoomSID];

    if (incomingCallNotificationID) {
        notifee.cancelNotification(incomingCallNotificationID).catch(console.warn);
    }
}

export async function endVideoCall(videoRoomSID) {
    console.info(`[endConsultationVideoCall:${videoRoomSID}:START]`);

    const call = _.find(calls, c => c.videoRoomSID === videoRoomSID);

    const isCallKeepConfigured = await connectionService.checkIsCallKeepConfigured();

    if (!call) {
        console.warn(`no call found for room ${videoRoomSID}`);
        return;
    } else if (isCallKeepConfigured) {
        RNCallKeep.endCall(call.uuid);
    }

    if (call.status === "completed") {
        // no need to re-complete brah
        console.info(`[endConsultationVideoCall:${videoRoomSID}]: call has already been completed`);
        return;
    }

    call.status = "completed";

    notifyCallStatusListeners(videoRoomSID, call.status);

    await VideoService.endVideoCall(videoRoomSID).catch(error => console.warn(`error ending video call ${videoRoomSID}`, error));

    navigateOnEndCall(call.consultationID, videoRoomSID);

    console.info(`[endConsultationVideoCall:${videoRoomSID}:DONE]`);
}

export async function rejectVideoCall(videoRoomSID) {
    const call = _.find(calls, c => c.videoRoomSID === videoRoomSID);

    if (!call) {
        console.warn(`no call found for room ${videoRoomSID}`);
        return;
    }

    call.status = "completed";

    notifyCallStatusListeners(videoRoomSID, call.status);

    activeCallManager.stopNotificationAlerts();

    await VideoService.rejectVideoCall(videoRoomSID);

    RNCallKeep.rejectCall(call.uuid);
}

const incomingPushKitCall = {
    uuid: null

}

const unregisteredAnswerableCall = {
    uuid: null
}

export function registerAnswerablePushKitCallUUID(pushKitCallUUID) {
    unregisteredAnswerableCall.uuid = pushKitCallUUID;
}

export async function registerPushKitCall(notification) {
    console.info("[connectionManager.registerPushKitCall]", {notification, unregisteredAnswerableCall});
    const {uuid, videoRoomSID, consultationID, callerDisplayName, callerPhoneNumber, callerEmail} = notification;

    incomingPushKitCall.uuid = uuid;

    const existingCall = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (existingCall) {
        console.info("already have call existing incoming call, skipping", existingCall);
        return;
    }

    const caller = {
        displayName: callerDisplayName,
        phoneNumber: callerPhoneNumber,
        email: callerEmail
    }

    await registerIncomingVideoCall(uuid, videoRoomSID, consultationID, caller);

    // FIXME
    // if (uuid === unregisteredAnswerableCall.uuid) {
    //     navigateOnAnswerCall(consultationID, videoRoomSID);
    // }
}
