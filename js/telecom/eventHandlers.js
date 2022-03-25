import React from "react";
import {AppState, Platform} from "react-native";
import VideoServiceAPI from "../api/video";
import videoServiceApi from "../api/video";
import RNCallKeep from "../callkeep";
import * as connectionManager from "./connectionManager";
import * as activeCallManager from "./activeCallManager";

let _navigateToVideoCall = null;

export function registerVideoCallNavigator(navigateToVideoCall) {
    _navigateToVideoCall = navigateToVideoCall;
}

export function navigateOnAnswerCall(consultationID, videoRoomSID, accessToken) {
    // TODO actually use access token in app
    _navigateToVideoCall(consultationID, videoRoomSID, accessToken);
}

export function navigateOnRejectCall() {

}

export async function handleIncomingVideoCall(videoCallPayload, navigateToVideoCall) {
    const {uuid, consultationID, callerUID, callerDisplayName, callerPhoneNumber, callerEmail, videoRoomSID} = videoCallPayload;

    const existingCall = connectionManager.getCallByUUID(uuid);

    if (existingCall) {
        console.info("[handleIncomingVideoCallNotification] already have call existing incoming call, skipping");
        return;
    }

    console.info(`[handleIncomingVideoCall] videoRoomSID: ${videoRoomSID}`);

    const getVideoCallResponse = await VideoServiceAPI.getVideoCall(videoRoomSID);
    console.debug("[handleIncomingVideoCall] getVideoCallResponse", getVideoCallResponse);

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

    registerVideoCallNavigator(navigateToVideoCall);

    const call = await connectionManager.registerIncomingVideoCall(null, videoRoomSID, consultationID, caller);

    await connectionManager.notifyIncomingCall(call);
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

        if (Platform.OS === "android") {
            // FIXME should this stay here? (see other FIXME)
            await RNCallKeep.reportEndCallWithUUID(call.uuid, 4);
            await activeCallManager.wakeMainActivity();
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

            navigateOnAnswerCall(consultationID, videoRoomSID);

            CallKeepEventHandlers.appStateChangeEventSubscriber?.remove();
            CallKeepEventHandlers.appStateChangeEventSubscriber = null;
        }

        console.debug(`[CallKeepEventHandlers:handleAnswerCall] app in "${AppState.currentState}" state.`);

        if (AppState.currentState === "active") {
            navigateOnAnswerCall(consultationID, videoRoomSID);
        } else {
            CallKeepEventHandlers.appStateChangeEventSubscriber = AppState.addEventListener("change", navigateOnActive);
        }

        console.debug("[CallKeepEventHandlers:handleAnswerCall:DONE]");
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
        console.debug("[handleDidLoadWithEvents]", events);
        const answeredCallAction = events.find(event => event.name === "RNCallKeepPerformAnswerCallAction");
        const incomingCallEvent = events.find(event => event.name === "RNCallKeepDidDisplayIncomingCall");
        console.debug("[handleDidLoadWithEvents]", {answeredCallAction});

        if (!answeredCallAction) {
            return;
        }

        const {callUUID: answeredCallUUID} = answeredCallAction.data;

        const callForAnswerCallAction = connectionManager.getCallByUUID(answeredCallUUID);
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

            navigateOnAnswerCall(consultationID, videoRoomSID);
        } else if (!callForAnswerCallAction) {
            // Very likely PushKit displayed the call but it hasn't yet been registered. Let PushKit know to navigate to this call
            connectionManager.registerAnswerablePushKitCallUUID(answeredCallUUID);
        }
    }
}

export class PushKitEventHandlers {
    static handleOnRegister(token) {
        console.debug(`[VoipPushNotification:EVENT:register:${token}]`);

        videoServiceApi.registerApnsToken(token).catch(error => console.warn(`[VoipPushNotification:EVENT:register:registerApnsToken]`, error));
    }

    static handleOnNotification(notification) {
        console.debug("[VoipPushNotification:EVENT:notification]", notification);

        connectionManager.registerPushKitCall(notification).catch(error => console.warn(`[VoipPushNotification:EVENT:notification:registerPushKitCall]`, error));
    }

    static handleOnDidLoadWithEvents(events) {
        console.debug("[VoipPushNotification:EVENT:didLoadWithEvents]", events);
        const incomingCallNotificationEvent = events.find(e => !!e.data?.videoRoomSID);
        console.debug("[VoipPushNotification:EVENT:didLoadWithEvents] incomingCallNotificationEvent", incomingCallNotificationEvent);
        if (!incomingCallNotificationEvent) {
            return;
        }

        const {callUUID: incomingCallUUID} = incomingCallNotificationEvent.data;

        const existingIncomingCall = connectionManager.getCallByUUID(incomingCallUUID);

        if (existingIncomingCall) {
            console.debug(`[VoipPushNotification:EVENT:didLoadWithEvents] ${incomingCallUUID} has already been handled elsewhere`);
            return;
        }

        console.debug(`[VoipPushNotification:EVENT:didLoadWithEvents] registering ${incomingCallUUID}`);
        connectionManager.registerPushKitCall(incomingCallNotificationEvent.data).catch(console.warn);
    }
}
