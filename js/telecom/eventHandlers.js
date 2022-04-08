import React from "react";
import {AppState, Platform, Vibration} from "react-native";
import videoServiceApi from "../api/video";
import usersServiceApi from "../api/users";
import RNCallKeep from "../callkeep";
import * as connectionManager from "./connectionManager";
import * as activeCallManager from "./activeCallManager";
import * as connectionService from "./connectionService";
import {endVideoCall, tryCancelVideoCallNotification} from "./connectionManager";

let _navigator = null;

export function registerVideoCallNavigator(navigator) {
    _navigator = navigator;
}

export function tryNavigateOnIncomingCall(consultationID, videoRoomSID, accessToken) {
    if (AppState.currentState === "active" && _navigator.onIncomingCall) {
        console.debug("[tryNavigateOnIncomingCall:YES]")
        _navigator.onIncomingCall(consultationID, videoRoomSID);
        return true;
    } else {
        console.debug("[tryNavigateOnIncomingCall:NO]")
        return false
    }
}

export function navigateOnAnswerCall(consultationID, videoRoomSID, accessToken) {
    _navigator.onAnswerCall(consultationID, videoRoomSID, accessToken);
}

export function navigateOnEndCall(consultationID, videoRoomSID) {
    activeCallManager.stopNotificationAlerts(); // just in case
    _navigator.onEndCall(consultationID, videoRoomSID);
}

export function navigateOnRejectCall() {
    activeCallManager.stopNotificationAlerts();
    _navigator.onEndCall();
}

export async function handleIncomingVideoCall(videoCallPayload) {
    const {uuid, consultationID, callerUID, callerDisplayName, callerPhoneNumber, callerEmail, videoRoomSID} = videoCallPayload;

    const existingCall = connectionManager.getCallByUUID(uuid);

    if (existingCall) {
        console.info("[handleIncomingVideoCallNotification] already have call existing incoming call, skipping");
        return;
    }

    console.info(`[handleIncomingVideoCall] videoRoomSID: ${videoRoomSID}`);

    const getVideoCallResponse = await videoServiceApi.getVideoCall(videoRoomSID);

    if (getVideoCallResponse.status !== "in-progress") {
        // valid statuses: in-progress, completed, failed
        console.info(`[handleIncomingVideoCall] not handling incoming call ${videoRoomSID}: remoteCall not in progress`);
        return;
    }

    const caller = {
        uid: callerUID,
        displayName: callerDisplayName,
        phoneNumber: callerPhoneNumber,
        email: callerEmail
    }

    const call = await connectionManager.registerIncomingVideoCall(null, videoRoomSID, consultationID, caller);

    await connectionManager.notifyIncomingCall(call);
}

export async function handleIncomingVideoCallEndedRemotely(callData) {
    console.info("handling video call ended remotely", callData);

    const {videoRoomSID} = callData;

    const call = connectionManager.getIncomingCall();

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

    activeCallManager.stopNotificationAlerts();
}

export class CallKeepEventHandlers {
    static appStateChangeEventSubscriber = null;

    static async handleAnswerCall({callUUID}) {
        console.info(`[CallKeep] received answerCall: ${callUUID}`);

        const call = connectionManager.getCallByUUID(callUUID);

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

        RNCallKeep.answerIncomingCall(call.uuid);

        const {consultationID, videoRoomSID} = call;
        console.info("[CallKeepEventHandlers:handleAnswerCall]", {videoRoomSID});

        const response = await videoServiceApi.requestVideoCallAccess(videoRoomSID);

        const {accessToken} = response;

        const navigateOnActive = async nextAppState => {
            if (nextAppState !== "active") {
                return;
            }

            navigateOnAnswerCall(consultationID, videoRoomSID, accessToken);

            CallKeepEventHandlers.appStateChangeEventSubscriber?.remove();
            CallKeepEventHandlers.appStateChangeEventSubscriber = null;
        }

        if (AppState.currentState === "active") {
            navigateOnAnswerCall(consultationID, videoRoomSID, accessToken);
        } else {
            CallKeepEventHandlers.appStateChangeEventSubscriber = AppState.addEventListener("change", navigateOnActive);
        }

        console.info("[CallKeepEventHandlers:handleAnswerCall:DONE]");
    }

    static handleDidDisplayIncomingCall({error, callUUID}) {
        if (error) {
            console.warn(`[CallKeep:handleDidDisplayIncomingCall:ERROR] ${error}`);
        } else {
            console.info("[CallKeep:handleDidDisplayIncomingCall]", {callUUID});
        }
    }

    static handleDidReceiveStartCallAction({handle}) {
        console.info(`[CallKeep] received didReceiveStartCallAction: ${handle}`);
    }

    static handleDidPerformSetMutedCallAction({callUUID, muted}) {
        console.info(`[CallKeep] received didPerformSetMutedCallAction: ${callUUID}:${muted}`);

        const call = connectionManager.getCallByUUID(callUUID);

        if (!call) {
            console.warn(`cannot handle set muted call: no call found with uuid ${callUUID}`);
            return;
        }

        activeCallManager.setLocalAudioEnabled(muted)
            .catch(error => console.warn(`error muting call: ${error}`))
            .then(() => call.isCallMuted = muted);
    }

    static handleDidToggleHoldCallAction({callUUID, hold}) {
        console.info(`[CallKeep] received didToggleHoldCallAction: ${callUUID}:${hold}`);

        const call = connectionManager.getCallByUUID(callUUID);

        if (!call) {
            console.warn(`cannot handle toggle hold: no call found with uuid ${callUUID}`);
            return;
        }

        activeCallManager.setLocalVideoEnabled(!hold)
            .catch(error => logError(`error holding call: ${error}`))
            .then(() => call.isCallHeld = hold);
    }

    static async handleEndCall({callUUID}) {
        console.info(`[CallKeep] received endCall: ${callUUID}`);

        const call = connectionManager.getCallByUUID(callUUID);

        if (!call) {
            console.info(`cannot end call: no call found with uuid ${callUUID}, but this may have already been handled`);
            return;
        }

        if (call.status === "in-progress") {
            await connectionManager.endVideoCall(call.videoRoomSID);
        } else if (call.status === "incoming") {
            await connectionManager.rejectVideoCall(call.videoRoomSID);
        }
    }

    static async handleDidLoadWithEvents(events) {
        console.info("[handleDidLoadWithEvents]", events);
        const answeredCallAction = events.find(event => event.name === "RNCallKeepPerformAnswerCallAction");
        const incomingCallEvent = events.find(event => event.name === "RNCallKeepDidDisplayIncomingCall");

        if (!answeredCallAction) {
            return;
        }

        const {callUUID: answeredCallUUID} = answeredCallAction.data;

        const callForAnswerCallAction = connectionManager.getCallByUUID(answeredCallUUID);

        if (callForAnswerCallAction && callForAnswerCallAction.status !== "incoming") {
            // This call has already been handled, leave it be
            console.info(`[handleDidLoadWithEvents] not handling answered call ${answeredCallUUID}`);
            return;
        }

        // FIXME for the PushKit case
        // const canAnswerCall = callForAnswerCallAction?.status === "incoming" || incomingPushKitCall.uuid === answeredCallUUID;
        const canAnswerCall = callForAnswerCallAction?.status === "incoming";

        if (canAnswerCall) {
            // This call was answered from the call UI and we need to go to the call NOW
            console.info("[handleDidLoadWithEvents] navigating to answered video call", callForAnswerCallAction.uuid);

            callForAnswerCallAction.status = "answering";

            const {consultationID, videoRoomSID} = callForAnswerCallAction;

            const response = await videoServiceApi.requestVideoCallAccess(videoRoomSID);
            console.info("[CallKeepEventHandlers:handleAnswerCall] response", response);

            const {accessToken} = response;

            navigateOnAnswerCall(consultationID, videoRoomSID, accessToken);
        } else if (!callForAnswerCallAction) {
            // Very likely PushKit displayed the call but it hasn't yet been registered. Let PushKit know to navigate to this call
            connectionManager.registerAnswerablePushKitCallUUID(answeredCallUUID);
        }
    }

    static async handleDidChangeAudioRoute(event) {
        console.info("[handleDidChangeAudioRoute]", event);
    }
}

export class PushKitEventHandlers {
    static handleOnRegister(token) {
        console.info(`[VoipPushNotification:EVENT:register:${token}]`);

        usersServiceApi.registerApnsToken(token).catch(error => console.warn(`[VoipPushNotification:EVENT:register:registerApnsToken]`, error));
    }

    static handleOnNotification(notification) {
        console.info("[VoipPushNotification:EVENT:notification]", notification);

        connectionManager.registerPushKitCall(notification).catch(error => console.warn(`[VoipPushNotification:EVENT:notification:registerPushKitCall]`, error));
    }

    static handleOnDidLoadWithEvents(events) {
        console.info("[VoipPushNotification:EVENT:didLoadWithEvents]", events);
        const incomingCallNotificationEvent = events.find(e => !!e.data?.videoRoomSID);

        if (!incomingCallNotificationEvent) {
            return;
        }

        const {callUUID: incomingCallUUID} = incomingCallNotificationEvent.data;

        const existingIncomingCall = connectionManager.getCallByUUID(incomingCallUUID);

        if (existingIncomingCall) {
            console.info(`[VoipPushNotification:EVENT:didLoadWithEvents] ${incomingCallUUID} has already been handled elsewhere`);
            return;
        }

        console.info(`[VoipPushNotification:EVENT:didLoadWithEvents] registering ${incomingCallUUID}`);
        connectionManager.registerPushKitCall(incomingCallNotificationEvent.data).catch(console.warn);
    }
}
