import uuid from "react-native-uuid-generator";
import _ from "lodash";
import notifee from "@notifee/react-native";
import RNCallKeep from "../callkeep";
import VideoService from "../api/video";
import * as activeCallManager from "./activeCallManager";
import * as connectionService from "./connectionService";
import {navigateOnEndCall} from "./eventHandlers";

const calls = [];
const callListeners = [];

const getNewCallUUID = async () => {
    const callUUID = await uuid.getRandomUUID();
    // have to toLowerCase because CallKeep internally lower cases that shit for whatever reason
    return callUUID.toLowerCase();
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

export function handleIncomingVideoCallStarted(videoRoomSID) {
    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (!call) {
        console.warn(`[handleIncomingVideoCallStarted] cannot start ${videoRoomSID}: no call found`);
        return;
    }

    call.status = "in-progress";
}

const incomingCallNotificationIDs = {};

export function tryCancelVideoCallNotification(videoRoomSID) {
    const incomingCallNotificationID = incomingCallNotificationIDs[videoRoomSID];

    if (incomingCallNotificationID) {
        notifee.cancelNotification(incomingCallNotificationID).catch(console.warn);
    }
}

export async function endVideoCall(videoRoomSID) {
    const call = _.find(calls, c => c.videoRoomSID === videoRoomSID);

    const isCallKeepConfigured = connectionService.checkIsCallKeepConfigured();

    if (!call) {
        console.warn(`no call found for room ${videoRoomSID}`);
        return;
    } else if (isCallKeepConfigured) {
        RNCallKeep.endCall(call.uuid);
    }

    if (call.status === "completed") {
        console.info(`[endConsultationVideoCall:${videoRoomSID}]: call has already been completed`);
        return;
    }

    call.status = "completed";

    notifyCallStatusListeners(videoRoomSID, call.status);

    await VideoService.endVideoCall(videoRoomSID).catch(error => console.warn(`error ending video call ${videoRoomSID}`, error));

    navigateOnEndCall(call.consultationID, videoRoomSID);
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

export async function registerPushKitCall(notification) {
    const {uuid, videoRoomSID, consultationID, callerDisplayName, callerPhoneNumber, callerEmail} = notification;

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
}
