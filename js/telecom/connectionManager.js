import uuid from "react-native-uuid-generator";
import _ from "lodash";
import {AppState, Platform} from "react-native";
import DeviceInfo from "react-native-device-info";
import RNCallKeep from "react-native-callkeep";
import VideoService from "../apis/video";
import * as activeCallManager from "./activeCallManager";
import * as connectionService from "./connectionService";

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
    if (Platform.OS === "ios") {
        // PushKit calls RNCallKeep natively in iOS to display incoming calls
        return;
    }

    const {videoRoomSID, consultationID, caller} = incomingCall;

    const isCallKeepConfigured = await connectionService.checkIsCallKeepConfigured();
    const androidVersion = Platform.OS !== "android" ? undefined : parseInt(DeviceInfo.getSystemVersion());
    const deviceModel = DeviceInfo.getModel();
    const isEligibleForCallKeepNotification = Platform.OS === "ios" || AppState.currentState === "active" || androidVersion < 12 || `${deviceModel}`.match(/Pixel \d.*/) === null;

    console.debug("[notifyIncomingCall]", {deviceModel, androidVersion, systemVersion: DeviceInfo.getSystemVersion(), appState: AppState.currentState, isEligibleForCallKeepNotification});

    if (Platform.OS === "android") {
        // TODO are both wakeMainActivity calls necessary?
        await activeCallManager.wakeMainActivity();
    }

    if (isCallKeepConfigured && isEligibleForCallKeepNotification) {
        console.debug(`[handleIncomingVideoCall:CallKeep] displaying incoming call ${videoRoomSID}:${incomingCall.uuid} | appState: ${AppState.currentState}`);
        await connectionService.setupCallKeep();

        RNCallKeep.displayIncomingCall(incomingCall.uuid, "HelloDoctor", caller.displayName, "generic", true);
    } else {
        console.debug(`[handleIncomingVideoCall:notification] displaying incoming call notification ${videoRoomSID}:${incomingCall.uuid} | appState: ${AppState.currentState}`);

        const incomingCallNotification = await getIncomingCallNotification(consultationID, videoRoomSID);

        tryCancelVideoCallNotification(videoRoomSID);

        incomingCallNotificationIDs[videoRoomSID] = await notifee
            .displayNotification(incomingCallNotification)
            .catch(error => console.warn(`error displaying incoming call notification`, error));
    }

    console.debug(`[handleIncomingVideoCall] displayed`);
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

    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (call?.status !== "incoming") {
        console.warn(`not handling ${videoRoomSID} call: invalid status "${call?.status}"`);
        return;
    }

    call.status = "in-progress";

    tryCancelVideoCallNotification(videoRoomSID);
}

export async function handleIncomingVideoCallEndedRemotely(callData) {
    console.info("handling video call ended remotely", callData);

    const {videoRoomSID} = callData;

    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (!call) {
        console.warn(`no call found for room ${videoRoomSID}`);
        return;
    }

    const isCallKeepConfigured = await connectionService.checkIsCallKeepConfigured();

    if (isCallKeepConfigured) {
        RNCallKeep.reportEndCallWithUUID(call.uuid, 2);
    }

    await endVideoCall(call.videoRoomSID);

    tryCancelVideoCallNotification(videoRoomSID);

    const currentRoute = getCurrentRoute();

    if (currentRoute?.name === "IncomingVideoCall") {
        NavigationService.resetToHome();
    }
}

const incomingCallNotificationIDs = {};

export function tryCancelVideoCallNotification(videoRoomSID) {
    console.debug("[tryCancelVideoCallNotification]")
    const incomingCallNotificationID = incomingCallNotificationIDs[videoRoomSID];

    if (incomingCallNotificationID) {
        console.debug("this.incomingCallNotificationID", incomingCallNotificationID);
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
    console.debug("[handlePushKitIncomingCallNotification] notification", notification);
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

    if (uuid === unregisteredAnswerableCall.uuid) {
        navigateToVideoCall(consultationID, videoRoomSID).catch(error => console.warn("[registerPushKitCall:navigateToVideoCall:ERROR]", error));
    }
}
