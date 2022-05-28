import React from "react";
import {AppState} from "react-native";
import videoServiceApi from "../api/video";
import usersServiceApi from "../api/users";
import RNCallKeep from "../callkeep";
import * as connectionManager from "./connectionManager";
import {endVideoCall, tryCancelVideoCallNotification} from "./connectionManager";
import * as activeCallManager from "./activeCallManager";
import * as connectionService from "./connectionService";

let _navigator = null;

export function registerVideoCallNavigator(navigator) {
    _navigator = navigator;
}

export function tryNavigateOnIncomingCall(consultationID, videoRoomSID) {
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

export async function handleIncomingVideoCallEndedRemotely(callData) {
    const {videoRoomSID} = callData;

    const call = connectionManager.getIncomingCall();

    if (!call) {
        console.warn(`no call found for room ${videoRoomSID}`);
        return;
    }

    const isCallKeepConfigured = connectionService.checkIsCallKeepConfigured();

    if (isCallKeepConfigured) {
        RNCallKeep.reportEndCallWithUUID(call.uuid, 2);
    }

    await endVideoCall(call.videoRoomSID);

    tryCancelVideoCallNotification(videoRoomSID);

    activeCallManager.stopNotificationAlerts();
}

let appStateChangeEventSubscriber = null;

async function doAnswerCall(callUUID) {
    const call = connectionManager.getCallByUUID(callUUID);

    if (!call) {
        console.warn(`cannot answer call: no call found with uuid ${callUUID}`);
        return;
    } else if (call.status === "answering") {
        console.info(`already answering call ${callUUID}`);
        return;
    }

    call.status = "answering";

    RNCallKeep.answerIncomingCall(call.uuid);

    const {consultationID, videoRoomSID} = call;

    const response = await videoServiceApi.requestVideoCallAccess(videoRoomSID);

    const {accessToken} = response;

    const navigateOnActive = async nextAppState => {
        if (nextAppState !== "active") {
            return;
        }

        navigateOnAnswerCall(consultationID, videoRoomSID, accessToken);

        appStateChangeEventSubscriber?.remove();
        appStateChangeEventSubscriber = null;
    }

    if (AppState.currentState === "active") {
        navigateOnAnswerCall(consultationID, videoRoomSID, accessToken);
    } else {
        appStateChangeEventSubscriber = AppState.addEventListener("change", navigateOnActive);
    }
}

export class CallKeepEventHandlers {
    static async handleAnswerCall({callUUID}) {
        await doAnswerCall(callUUID);
    }

    static handleDidPerformSetMutedCallAction({callUUID, muted}) {
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
        const call = connectionManager.getCallByUUID(callUUID);

        if (!call) {
            console.warn(`cannot handle toggle hold: no call found with uuid ${callUUID}`);
            return;
        }

        activeCallManager.setLocalVideoEnabled(!hold)
            .catch(error => console.warn(`error holding call: ${error}`))
            .then(() => call.isCallHeld = hold);
    }

    static async handleEndCall({callUUID}) {
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
        const answeredCallAction = events.find(event => event.name === "RNCallKeepPerformAnswerCallAction");

        if (!answeredCallAction) {
            return;
        }

        const {callUUID: answeredCallUUID} = answeredCallAction.data;

        const registeredCall = connectionManager.getCallByUUID(answeredCallUUID);

        if (registeredCall && registeredCall.status !== "incoming") {
            // This call has already been handled
            return;
        }

        const canAnswerCall = registeredCall?.status === "incoming";

        if (canAnswerCall) {
            // This call was answered from the call UI and we need to go to the call NOW
            await doAnswerCall(registeredCall.uuid);
        } else if (!registeredCall) {
            // Very likely PushKit displayed the call but it hasn't yet been registered. Let PushKit know to navigate to this call
            answerablePushKitCallUUID = answeredCallUUID;
        }
    }
}

let answerablePushKitCallUUID = null;

export class PushKitEventHandlers {
    static handleOnRegister(token) {
        usersServiceApi.registerApnsToken(token).catch(error => console.warn(`[VoipPushNotification:EVENT:register:registerApnsToken]`, error));
    }

    static handleOnNotification(notification) {
        console.info("[VoipPushNotification:EVENT:notification]", notification);

        connectionManager.registerPushKitCall(notification)
            .catch(error => console.warn(`[VoipPushNotification:EVENT:notification:registerPushKitCall]`, error));
    }

    static handleOnDidLoadWithEvents(events) {
        const incomingCallNotificationEvent = events.find(e => !!e.data?.videoRoomSID);

        if (!incomingCallNotificationEvent) {
            return;
        }

        const incomingCallData = incomingCallNotificationEvent.data;
        const {uuid} = incomingCallNotificationEvent.data;

        const existingIncomingCall = connectionManager.getCallByUUID(uuid);

        if (existingIncomingCall) {
            return;
        }

        connectionManager.registerPushKitCall(incomingCallData).catch(console.warn);

        if (answerablePushKitCallUUID === uuid) {
            // This call was displayed by PushKit while the app was in a quit state. The user then answered the call, the
            // event for which has already been handled by CallKeepEventHandlers.handleDidLoadWithEvents. However, that
            // event payload only includes the callUUID, so without the call having been registered beforehand it
            // could not be answered. Instead, it registers it as `answerablePushKitCallUUID`, in anticipation of this
            // very function right here to handle the answering.
            doAnswerCall(uuid)
                .catch((error) => console.warn(`[PushKitEventHandlers:handleOnDidLoadWithEvents:doAnswerCall]`, error))
                .finally(() => answerablePushKitCallUUID = null);
        }
    }
}
