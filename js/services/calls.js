import _ from "lodash";
import moment from "moment";
import React from "react";
import {AppState, Platform, PermissionsAndroid, Linking} from "react-native";
import RNCallKeep from "react-native-callkeep";
import uuid from "react-native-uuid-generator";
import VoipPushNotification from "react-native-voip-push-notification";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import notifee from "@notifee/react-native";

import {HDVideo} from "../HDVideo";
import VideoService from "./api";
import Permissions, {PERMISSIONS} from "react-native-permissions";
import DeviceInfo from "react-native-device-info";
import AsyncStorage from "@react-native-community/async-storage";

const NavigationService = {};
const logError = console.warn;
const getCurrentRoute = () => {};
const getIncomingCallNotification = () => {};
const firebaseListeners = {};
const getThisDeviceSnapshot = () => {};
const getCurrentUserRef = () => {};
const getCurrentUserRole = () => {};

const calls = [];
const callListeners = [];

const remoteCallSnapshotListeners = {};

const getNewCallUUID = async () => {
    const callUUID = await uuid.getRandomUUID();
    // have to toLower because CallKeep internally lower cases that shit for whatever reason
    return _.toLower(callUUID);
}

export function getVideoCallStatus(videoRoomSID) {
    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    return call?.status;
}

export function getActiveCall() {
    return _.find(calls, c => c.status === "in-progress");
}

export function getIncomingCall() {
    console.debug("CALLS", calls);
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

function registerRemoteCallSnapshotListener(videoRoomSID) {
    console.info(`[registerRemoteCallSnapshotListener] videoRoomSID: ${videoRoomSID}`);

    firebaseListeners.remove(remoteCallSnapshotListeners[videoRoomSID]);

    const remoteCallRef = firestore().doc(`calls/${videoRoomSID}`);

    remoteCallSnapshotListeners[videoRoomSID] = remoteCallRef.onSnapshot(remoteCallSnapshot => {
        if (!remoteCallSnapshot || !remoteCallSnapshot.exists) {
            console.warn(`got empty snapshot for call ${videoRoomSID}`);
            return;
        }

        const remoteCall = remoteCallSnapshot.data();
        const existingCall = calls.find(c => c.videoRoomSID === videoRoomSID);
        console.debug(`[registerRemoteCallSnapshotListener:onSnapshot] remoteCall.status: ${remoteCall?.status} | existingCall.status: ${existingCall?.status}`);
        if (remoteCall.status === "completed" && remoteCall.status !== existingCall?.status) {
            endConsultationVideoCall(videoRoomSID).catch(error => logError(`error ending consultation video call: ${error}`));
        }
    })

    firebaseListeners.register(remoteCallSnapshotListeners[videoRoomSID]);
}

function registerIncomingVideoCall(uuid, videoRoomSID, consultationID, caller) {
    const call = {
        uuid,
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

export async function handleIncomingConsultationVideoCallNotification(notificationData) {
    const {uuid, consultationID, callerUID, callerDisplayName, callerPhoneNumber, callerEmail, videoRoomSID} = notificationData;

    const existingCall = calls.find(c => c.uuid === uuid);

    if (existingCall) {
        console.info("[handleIncomingConsultationVideoCallNotification] already have call existing incoming call, skipping");
        return;
    }

    console.info(`[handleIncomingConsultationVideoCallNotification] videoRoomSID: ${videoRoomSID}`);

    const getVideoCallResponse = await VideoService.getVideoCall(videoRoomSID);
    console.debug("[handleIncomingConsultationVideoCallNotification] getVideoCallResponse", getVideoCallResponse);

    if (getVideoCallResponse.status !== "in-progress") {
        // valid statuses: in-progress, completed, failed
        console.info(`[handleIncomingConsultationVideoCall] not handling incoming call ${videoRoomSID}: remoteCall not in progress`);
        return;
    }

    registerRemoteCallSnapshotListener(videoRoomSID);

    const caller = {
        uid: callerUID,
        displayName: callerDisplayName,
        phoneNumber: callerPhoneNumber,
        email: callerEmail
    }

    const newCallUUID = await getNewCallUUID();

    const call = registerIncomingVideoCall(newCallUUID, videoRoomSID, consultationID, caller);

    await displayIncomingCallNotification(call);
}

const incomingCallNotificationIDs = {};

const tryCancelVideoCallNotification = videoRoomSID => {
    console.debug("[tryCancelVideoCallNotification]")
    const incomingCallNotificationID = incomingCallNotificationIDs[videoRoomSID];

    if (incomingCallNotificationID) {
        console.debug("this.incomingCallNotificationID", incomingCallNotificationID);
        notifee.cancelNotification(incomingCallNotificationID).catch(console.warn);
    }
}

export async function checkIsCallKeepConfigured() {
    if (Platform.OS === "ios") {
        return true;
    }

    const readPhoneNumbersPermission = await PermissionsAndroid.check('android.permission.READ_PHONE_NUMBERS');
    console.debug("[checkIsCallKeepConfigured]", {readPhoneNumbersPermission});

    if (!readPhoneNumbersPermission) {
        return false;
    }

    await bootstrapCallsService();
    const isConnectionServiceAvailable = await RNCallKeep.isConnectionServiceAvailable();
    const hasPhoneAccount = await RNCallKeep.hasPhoneAccount();
    const hasPhoneAccountEnabled = await RNCallKeep.checkPhoneAccountEnabled();

    console.debug("[checkIsCallKeepConfigured]", {isConnectionServiceAvailable, hasPhoneAccountEnabled, hasPhoneAccount});
    return isConnectionServiceAvailable && hasPhoneAccountEnabled;
}

async function displayIncomingCallNotification(incomingCall) {
    if (Platform.OS === "ios") {
        // PushKit calls RNCallKeep natively in iOS to display incoming calls
        return;
    }

    const {videoRoomSID, consultationID, caller} = incomingCall;

    const isCallKeepConfigured = await checkIsCallKeepConfigured();
    const androidVersion = Platform.OS !== "android" ? undefined : parseInt(DeviceInfo.getSystemVersion());
    const deviceModel = DeviceInfo.getModel();
    const isEligibleForCallKeepNotification = Platform.OS === "ios" || AppState.currentState === "active" || androidVersion < 12 || `${deviceModel}`.match(/Pixel \d.*/) === null;

    console.debug("[displayIncomingCallNotification]", {deviceModel, androidVersion, systemVersion: DeviceInfo.getSystemVersion(), appState: AppState.currentState, isEligibleForCallKeepNotification});

    if (Platform.OS === "android") {
        // TODO are both wakeMainActivity calls necessary?
        await HDVideo.wakeMainActivity();
    }

    if (isCallKeepConfigured && isEligibleForCallKeepNotification) {
        console.debug(`[handleIncomingConsultationVideoCall:CallKeep] displaying incoming call ${videoRoomSID}:${incomingCall.uuid} | appState: ${AppState.currentState}`);
        await RNCallKeep.registerPhoneAccount(callKeepConfig);
        await RNCallKeep.registerAndroidEvents(callKeepConfig);
        RNCallKeep.displayIncomingCall(incomingCall.uuid, "HelloDoctor", caller.displayName, "generic", true);
    } else {
        console.debug(`[handleIncomingConsultationVideoCall:notification] displaying incoming call notification ${videoRoomSID}:${incomingCall.uuid} | appState: ${AppState.currentState}`);

        const incomingCallNotification = await getIncomingCallNotification(consultationID, videoRoomSID);

        tryCancelVideoCallNotification(videoRoomSID);

        incomingCallNotificationIDs[videoRoomSID] = await notifee
            .displayNotification(incomingCallNotification)
            .catch(error => logError(`error displaying incoming call notification: ${error}`));
    }

    console.debug(`[handleIncomingConsultationVideoCall] displayed`);
}

export function handleIncomingConsultationVideoCallStarted(videoRoomSID) {
    console.info(`[handleIncomingConsultationVideoCallStarted] videoRoomSID: ${videoRoomSID}`, videoRoomSID);

    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (!call) {
        console.warn(`[handleIncomingConsultationVideoCallStarted] cannot start ${videoRoomSID}: no call found`);
        return;
    }

    call.status = "in-progress";

    // RNCallKeep.answerIncomingCall(call.uuid);
    // RNCallKeep.reportEndCallWithUUID(call.uuid, 4);

    tryCancelVideoCallNotification(videoRoomSID);
}

export function handleIncomingConsultationVideoCallAnswered(videoRoomSID) {
    console.info(`[handleIncomingConsultationVideoCallAnswered] videoRoomSID: ${videoRoomSID}`, videoRoomSID);

    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (call?.status !== "incoming") {
        console.warn(`not handling ${videoRoomSID} call: invalid status "${call?.status}"`);
        return;
    }

    call.status = "in-progress";

    // RNCallKeep.answerIncomingCall(call.uuid);

    tryCancelVideoCallNotification(videoRoomSID);
}

export async function handleIncomingConsultationVideoCallEndedRemotely(callData) {
    console.info("handling video call ended remotely", callData);

    const {videoRoomSID} = callData;

    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (!call) {
        console.warn(`no call found for room ${videoRoomSID}`);
        return;
    }

    const isCallKeepConfigured = await checkIsCallKeepConfigured();

    if (isCallKeepConfigured) {
        RNCallKeep.reportEndCallWithUUID(call.uuid, 2);
    }

    await endConsultationVideoCall(call.videoRoomSID);

    tryCancelVideoCallNotification(videoRoomSID);

    const currentRoute = getCurrentRoute();

    if (currentRoute?.name === "IncomingVideoCall") {
        NavigationService.resetToHome();
    }
}

export async function endConsultationVideoCall(videoRoomSID) {
    console.info(`[endConsultationVideoCall:${videoRoomSID}:START]`);

    const call = _.find(calls, c => c.videoRoomSID === videoRoomSID);

    const isCallKeepConfigured = await checkIsCallKeepConfigured();

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

    await VideoService.endVideoCall(videoRoomSID).catch(error => logError(`error ending video call ${videoRoomSID}: ${JSON.stringify(error)}`))

    console.info(`[endConsultationVideoCall:${videoRoomSID}:DONE]`);
}

export async function rejectConsultationVideoCall(videoRoomSID) {
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

let _didNavigateToVideoCall = false;

export function checkDidNavigateToVideoCall() {
    return _didNavigateToVideoCall;
}

export function setDidNavigateToVideoCall(didNavigateToVideoCall) {
    _didNavigateToVideoCall = didNavigateToVideoCall;
}

export async function navigateToVideoCall(consultationID, videoRoomSID) {
    setDidNavigateToVideoCall(true);

    const response = await VideoService.requestConsultationVideoCallAccess(consultationID, videoRoomSID);
    console.debug("[navigateToVideoCall:RESPONSE]", response);
    const {accessToken} = response;
    console.debug("[CallKeepEventHandlers:navigateToVideoCall:NAVIGATING]", {videoRoomSID});
    NavigationService.push("AuthenticatedStack", {screen: "VideoCallStack", params: {consultationID, videoRoomSID, accessToken}});
}

export async function navigateToIncomingVideoCall(consultationID, videoRoomSID) {
    const response = await VideoService.requestConsultationVideoCallAccess(consultationID, videoRoomSID);

    const {accessToken} = response;
    console.debug("[CallKeepEventHandlers:navigateToIncomingVideoCall:NAVIGATING]", {videoRoomSID, accessToken});
    NavigationService.push("AuthenticatedStack", {screen: "VideoCallStack", params: {consultationID, videoRoomSID, accessToken, initialRouteName: "IncomingVideoCall"}});
}

class CallKeepEventHandlers {
    static appStateChangeEventSubscriber = null;

    static async handleAnswerCall({callUUID}) {
        console.info(`[CallKeep] received answerCall: ${callUUID}`);

        const call = _.find(calls, c => c.uuid === callUUID);

        if (!call && Platform.OS === "ios") {
            console.warn(`cannot answer call: no call found with uuid ${callUUID}, sleeping and retrying shortly`);
            setTimeout(() => CallKeepEventHandlers.handleAnswerCall({callUUID}), 500);
        } else if (!call) {
            console.warn(`cannot answer call: no call found with uuid ${callUUID}`);
            return;
        } else if (call.status === "answering") {
            console.info(`already answering call ${callUUID}`);
            return;
        }

        call.status = "answering";

        if (Platform.OS === "android") {
            // FIXME should this stay here? (see other FIXME)
            await RNCallKeep.reportEndCallWithUUID(call.uuid, 4);
            await HDVideo.wakeMainActivity();
        } else {
            RNCallKeep.answerIncomingCall(call.uuid);
        }

        const {consultationID, videoRoomSID} = call;
        console.debug("[CallKeepEventHandlers:handleAnswerCall]", {videoRoomSID});

        const navigateOnActive = async nextAppState => {
            console.debug("[CallKeepEventHandlers:handleAnswerCall:navigateOnActive]", {videoRoomSID, nextAppState});
            if (nextAppState !== "active") {
                return;
            }

            navigateToVideoCall(consultationID, videoRoomSID).catch(error => console.warn("[CallKeepEventHandlers:navigateOnActive:doNavigateToVideoCall:ERROR]", error));

            CallKeepEventHandlers.appStateChangeEventSubscriber?.remove();
            CallKeepEventHandlers.appStateChangeEventSubscriber = null;
        }

        console.debug(`[CallKeepEventHandlers:handleAnswerCall] app in "${AppState.currentState}" state.`);

        if (AppState.currentState === "active") {
            navigateToVideoCall(consultationID, videoRoomSID).catch(error => console.warn("[CallKeepEventHandlers:handleAnswerCall:doNavigateToVideoCall:ERROR]", error));
        } else {
            CallKeepEventHandlers.appStateChangeEventSubscriber = AppState.addEventListener("change", navigateOnActive);
        }

        console.debug("[CallKeepEventHandlers:handleAnswerCall:DONE]");
    }

    static handleDidDisplayIncomingCall({error, callUUID}) {
        console.info("[CallKeep:handleDidDisplayIncomingCall]", {error, callUUID});

        if (error) {
            logError(`[CallKeep:handleDidDisplayIncomingCall:ERROR] ${error}`);
            return;
        }

        const call = calls.find(c => c.uuid === callUUID);
        tryCancelVideoCallNotification(call?.videoRoomSID);
    }

    static handleDidReceiveStartCallAction({handle}) {
        console.info(`[CallKeep] received didReceiveStartCallAction: ${handle}`);
    }

    static handleDidPerformSetMutedCallAction({callUUID, muted}) {
        console.info(`[CallKeep] received didPerformSetMutedCallAction: ${callUUID}:${muted}`);

        const call = _.find(calls, c => c.uuid === callUUID);

        if (!call) {
            console.warn(`cannot handle set muted call: no call found with uuid ${callUUID}`);
            return;
        }

        HDVideo.setLocalAudioEnabled(muted)
            .catch(error => logError(`error muting call: ${error}`))
            .then(() => call.isCallMuted = muted);
    }

    static handleDidToggleHoldCallAction({callUUID, hold}) {
        console.info(`[CallKeep] received didToggleHoldCallAction: ${callUUID}:${hold}`);

        const call = _.find(calls, c => c.uuid === callUUID);

        if (!call) {
            console.warn(`cannot handle toggle hold: no call found with uuid ${callUUID}`);
            return;
        }

        HDVideo.setLocalVideoEnabled(!hold)
            .catch(error => logError(`error holding call: ${error}`))
            .then(() => call.isCallHeld = hold);
    }

    static async handleEndCall({callUUID}) {
        console.info(`[CallKeep] received endCall: ${callUUID}`);

        const call = _.find(calls, c => c.uuid === callUUID);

        if (!call) {
            console.info(`cannot end call: no call found with uuid ${callUUID}, but this may have already been handled`);
            return;
        }

        if (call.status === "in-progress") {
            await endConsultationVideoCall(call.videoRoomSID);
        } else if (call.status === "incoming") {
            await rejectConsultationVideoCall(call.videoRoomSID);
        }
    }

    static async handleDidLoadWithEvents(events) {
        console.debug("[handleDidLoadWithEvents]", events);
        const answeredCallAction = events.find(event => event.name === "RNCallKeepPerformAnswerCallAction");
        const incomingCallEvent = events.find(event => event.name === "RNCallKeepDidDisplayIncomingCall");
        console.debug("[handleDidLoadWithEvents]", {answeredCallAction});

        if (!answeredCallAction) {
            return;
        }

        const {callUUID: answeredCallUUID} = answeredCallAction.data;

        const callForAnswerCallAction = calls.find(call => call.uuid === answeredCallUUID);
        console.debug("[handleDidLoadWithEvents] answeredCall", callForAnswerCallAction);

        if (callForAnswerCallAction && callForAnswerCallAction.status !== "incoming") {
            // This call has already been handled, leave it be
            console.debug(`[handleDidLoadWithEvents] not handling answered call ${answeredCallUUID}`);
            return;
        }

        const canAnswerCall = callForAnswerCallAction?.status === "incoming" || incomingPushKitCall.uuid === answeredCallUUID;

        if (canAnswerCall) {
            // This call was answered from the call UI and we need to go to the call NOW
            console.debug("[handleDidLoadWithEvents] navigating to answered video call", callForAnswerCallAction.uuid);

            callForAnswerCallAction.status = "answering";

            const {consultationID, videoRoomSID} = callForAnswerCallAction;

            navigateToVideoCall(consultationID, videoRoomSID).catch(error => console.warn("[CallKeepEventHandlers:handleDidLoadWithEvents:doNavigateToVideoCall:ERROR]", error));
        } else if (!callForAnswerCallAction) {
            // Very likely PushKit displayed the call but it hasn't yet been registered. Let PushKit know to navigate to this call
            unregisteredAnswerableCall.uuid = answeredCallUUID;
        }
    }
}

const incomingPushKitCall = {
    uuid: null
}

const unregisteredAnswerableCall = {
    uuid: null
}

let isBootstrappingInProgressCall = false;

export async function tryHandleBootstrappingInProgressCall() {
    return;
    if (isBootstrappingInProgressCall) {
        console.debug("[tryHandleBootstrappingInProgressCall] not bootstrapping, already in progress");
        return;
    }

    isBootstrappingInProgressCall = true;

    console.debug("[tryHandleBootstrappingInProgressCall]");
    const {currentUser} = auth();

    if (!currentUser) {
        return;
    }

    const inProgressCallsSnapshot = await firestore().collection(`users/${currentUser.uid}/calls`)
        .where("recipientUID", "==", currentUser.uid)
        .where("status", "==", "in-progress")
        .get();

    if (inProgressCallsSnapshot.empty) {
        console.debug("[tryHandleBootstrappingInProgressCall] no in-progress calls");
        return;
    }
    console.debug("[tryHandleBootstrappingInProgressCall] inProgressCallsSnapshot.size", inProgressCallsSnapshot.size);
    const inProgressCallSnapshot = _.first(_.sortBy(inProgressCallsSnapshot.docs, snapshot => snapshot.get("startTime")?.toDate()).reverse());
    const inProgressCall = inProgressCallSnapshot.data();
    const {consultation, videoRoomSID} = inProgressCallSnapshot.data();

    const getVideoCallResponse = await VideoService.getVideoCall(videoRoomSID);
    console.debug("[tryHandleBootstrappingInProgressCall] getVideoCallResponse", getVideoCallResponse);

    if (getVideoCallResponse.status !== "in-progress") {
        // So... this is kind of bullshit, but it's safe and effective and - so long as there's a possibility the user-calls collection
        // might not be perfectly in sync with twilio - we're going to do this ok?!
        console.warn(`[tryHandleBootstrappingInProgressCall] ${videoRoomSID} says its in progress but its not, fixing that right now`);
        inProgressCallSnapshot.ref.update({status: getVideoCallResponse.status});
        return;
    }
    console.debug(`[tryHandleBootstrappingInProgressCall] got in progress call ${videoRoomSID}`, inProgressCall);

    const existingCall = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (existingCall && existingCall.status !== "incoming") {
        console.info(`[tryHandleBootstrappingInProgressCall] not handling existing call ${existingCall.videoRoomSID}`);
        return;
    }

    const call = {
        uuid: existingCall?.uuid || await getNewCallUUID(),
        consultationID: consultation.id,
        videoRoomSID,
        status: getVideoCallResponse.status,
        isCallMuted: false,
        isCallHeld: false
    };

    calls.push(call);

    // handleIncomingConsultationVideoCallNotification(inProgressCall, true)
    //     .catch(error => logError(`error handling bootstrapped incoming call: ${error}`))
    //     .finally(() => isBootstrappingInProgressCall = false);

    // This is acceptable (read: justified)

    const doNavigate = () => {
        console.debug("[doNavigate]")
        NavigationService.resetToHome();
        const toVideo = () => {
            console.debug("[toVideo]")
            NavigationService.navigate("VideoCallStack", {
                screen: "IncomingVideoCall",
                params: {consultationID: consultation.id, videoRoomSID, autoAccept: Platform.OS === "ios"}
            });
        }

        setTimeout(toVideo, 500);
    }

    setTimeout(doNavigate, 10);

    return true;
}

let isCallsServiceBootstrapped = false;

export async function bootstrapCallsService() {
    console.info("[bootstrapCallsService:START]", {isCallsServiceBootstrapping: isCallsServiceBootstrapped});
    // if (isCallsServiceBootstrapped) {
    //     console.info("[bootstrapCallsService] not bootstrapping: already bootstrapped");
    //     return;
    // }

    const canSetupCallKeep = await checkCanSetupCallKeep();

    if (!canSetupCallKeep) {
        console.info("[bootstrapCallsService] can't setup CallKeep");
        return;
    }

    console.info("[bootstrapCallsService] setting up CallKeep");

    await setupCallKeep().catch(error => logError(`error setting up CallKeep: ${error}`));

    registerCallKeepListeners();

    if (Platform.OS === "android") {
        RNCallKeep.setAvailable(true);
    }

    isCallsServiceBootstrapped = true;
}

export async function tearDownCallsService() {
    removeCallKeepListeners();

    RNCallKeep.endAllCalls();

    if (Platform.OS === "android") {
        RNCallKeep.setAvailable(false);
    }

    if (videoConsultationsSnapshotListener !== null) {
        videoConsultationsSnapshotListener();
        videoConsultationsSnapshotListener = null;
    }
}

let videoConsultationsSnapshotListener = null;

async function checkCanSetupCallKeep() {
    const hasTriedCallKeepConfig = await checkHasTriedCallKeepConfig();
    console.debug("[checkCanSetupCallKeep]", {hasTriedCallKeepConfig});
    if (hasTriedCallKeepConfig) {
        return true;
    }

    const videoConsultationsSnapshot = await getCurrentUserRef()
        .collection("consultations")
        .where("type", "==", "video")
        .get();

    return !videoConsultationsSnapshot.empty;
}

export async function checkHasTriedCallKeepConfig() {
    return await AsyncStorage.getItem(`has-tried-call-keep-config-${getCurrentUserRef().id}`) === "true";
}

export async function setHasTriedCallKeepConfig() {
    return await AsyncStorage.setItem(`has-tried-call-keep-config-${getCurrentUserRef().id}`, "true");
}

const callKeepConfig = {
    android: {
        alertTitle: "Permisos para videollamadas",
        alertDescription: "Para una mejor experiencia de videollamadas, agregue Hello Doctor como una cuenta telefónica",
        cancelButton: "Cancel",
        okButton: "ok",
        // additionalPermissions: [PERMISSIONS.ANDROID.READ_PHONE_STATE, PERMISSIONS.ANDROID.READ_PHONE_NUMBERS],
        foregroundService: {
            channelId: "com.hellodoctormx.patient",
            channelName: "Hello Doctor Llamadas",
            notificationTitle: "Hello Doctor Videollamada",
        }
    }
};

async function setupCallKeep() {
    if (getCurrentUserRole() !== "patient" || Platform.OS === "ios" || DeviceInfo.isTablet()) {
        return;
    }

    await RNCallKeep.registerPhoneAccount(callKeepConfig);
    await RNCallKeep.registerAndroidEvents();
}

let hasRegisteredCallKeepListeners = false;

function registerCallKeepListeners() {
    console.info("[calls:registerCallKeepListeners]", {hasRegisteredCallKeepListeners});

    if (hasRegisteredCallKeepListeners) {
        return;
        removeCallKeepListeners();
    }

    RNCallKeep.addEventListener("answerCall", CallKeepEventHandlers.handleAnswerCall);
    RNCallKeep.addEventListener("didDisplayIncomingCall", CallKeepEventHandlers.handleDidDisplayIncomingCall);
    RNCallKeep.addEventListener("didReceiveStartCallAction", CallKeepEventHandlers.handleDidReceiveStartCallAction);
    RNCallKeep.addEventListener("didPerformSetMutedCallAction", CallKeepEventHandlers.handleDidPerformSetMutedCallAction);
    RNCallKeep.addEventListener("didToggleHoldCallAction", CallKeepEventHandlers.handleDidToggleHoldCallAction);
    RNCallKeep.addEventListener("endCall", CallKeepEventHandlers.handleEndCall);
    RNCallKeep.addEventListener("didLoadWithEvents", CallKeepEventHandlers.handleDidLoadWithEvents);

    if (Platform.OS === "ios") {
        setupPushKitNotifications();
    }

    hasRegisteredCallKeepListeners = true;

    console.info("[calls:registerCallKeepListeners:DONE]");
}

function removeCallKeepListeners() {
    RNCallKeep.removeEventListener("answerCall");
    RNCallKeep.removeEventListener("didDisplayIncomingCall");
    RNCallKeep.removeEventListener("didReceiveStartCallAction");
    RNCallKeep.removeEventListener("didPerformSetMutedCallAction");
    RNCallKeep.removeEventListener("didToggleHoldCallAction");
    RNCallKeep.removeEventListener("endCall");
    RNCallKeep.removeEventListener("didLoadWithEvents");

    if (Platform.OS === "ios") {
        VoipPushNotification.removeEventListener("register");
        VoipPushNotification.removeEventListener("notification");
        VoipPushNotification.removeEventListener("didLoadWithEvents");
    }

    hasRegisteredCallKeepListeners = false;
}

function setupPushKitNotifications() {
    VoipPushNotification.addEventListener("register", token => {
        console.debug(`[VoipPushNotification:EVENT:register:${token}]`);

        registerApnsToken(token).catch(error => logError(`[calls.js:setupsPushKitNotifications:registerApnsToken] ${JSON.stringify(error)}`, error));
    });

    VoipPushNotification.addEventListener("notification", notification => {
        console.debug("[VoipPushNotification:EVENT:notification]", notification);

        registerPushKitCall(notification);
    });

    VoipPushNotification.addEventListener("didLoadWithEvents", events => {
        console.debug("[VoipPushNotification:EVENT:didLoadWithEvents]", events);
        const incomingCallNotificationEvent = events.find(e => !!e.data?.videoRoomSID);
        console.debug("[VoipPushNotification:EVENT:didLoadWithEvents] incomingCallNotificationEvent", incomingCallNotificationEvent);
        if (!incomingCallNotificationEvent) {
            return;
        }

        const {callUUID: incomingCallUUID} = incomingCallNotificationEvent.data;

        const existingIncomingCall = calls.find(call => call.uuid === incomingCallUUID);

        if (existingIncomingCall) {
            console.debug(`[VoipPushNotification:EVENT:didLoadWithEvents] ${incomingCallUUID} has already been handled elsewhere`);
            return;
        }

        console.debug(`[VoipPushNotification:EVENT:didLoadWithEvents] registering ${incomingCallUUID}`);
        registerPushKitCall(incomingCallNotificationEvent.data);
    });

    VoipPushNotification.registerVoipToken();
}

function registerPushKitCall(notification) {
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

    registerIncomingVideoCall(uuid, videoRoomSID, consultationID, caller);

    registerRemoteCallSnapshotListener(videoRoomSID);

    if (uuid === unregisteredAnswerableCall.uuid) {
        navigateToVideoCall(consultationID, videoRoomSID).catch(error => console.warn("[registerPushKitCall:navigateToVideoCall:ERROR]", error));
    }
}

async function registerApnsToken(token) {
    const deviceSnapshot = await getThisDeviceSnapshot();
    await deviceSnapshot.ref.update({apnsToken: token});
}

export async function unregisterApnsToken() {
    if (Platform.OS !== "ios") return;

    const deviceSnapshot = await getThisDeviceSnapshot();
    await deviceSnapshot.ref.update({apnsToken: null});
}
