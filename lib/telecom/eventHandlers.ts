import {AppState, NativeEventSubscription, NativeModules, Platform} from "react-native";
import videoServiceApi from "../api/video";
import RNCallKeep from "../callkeep";
import * as connectionManager from "./connectionManager";
import {endVideoCall, tryCancelVideoCallNotification} from "./connectionManager";
import * as activeCallManager from "./activeCallManager";
import HDConfig from "../HDConfig";

const {RNHelloDoctorModule} = NativeModules;

export function navigateOnAnswerCall(consultationID: string, videoRoomSID: string, accessToken: string) {
    HDConfig.onAnswerCall(consultationID, videoRoomSID, accessToken);
}

export function navigateOnEndCall(consultationID: string, videoRoomSID: string) {
    HDConfig.onEndCall(consultationID, videoRoomSID);
}

export async function handleIncomingVideoCallNotification(videoRoomSID: string, callerDisplayName: string, callerPhotoURL?: string) {
    await connectionManager.registerIncomingVideoCall(null, videoRoomSID, null, {displayName: callerDisplayName})

    return activeCallManager.displayIncomingCallNotification(videoRoomSID, callerDisplayName, callerPhotoURL);
}

// deprecated: use handleVideoCallEndedNotification
export async function handleIncomingVideoCallEndedRemotely(videoRoomSID: string) {
    const call = connectionManager.getIncomingCall();

    if (!call) {
        console.warn(`no call found for room ${videoRoomSID}`);
        return;
    }

    RNCallKeep.reportEndCallWithUUID(call.uuid, 2);

    await endVideoCall(videoRoomSID);

    tryCancelVideoCallNotification(videoRoomSID);
}

export async function handleVideoCallEndedNotification(videoRoomSID: string) {
    if (Platform.OS === "android") {
        await RNHelloDoctorModule
            .rejectIncomingCallNotification()
            .catch((error) => console.warn(`[handleIncomingVideoCallEndedRemotely:tryCancelVideoCallNotification]`, error));
    }

    const call = connectionManager.getIncomingCall();

    if (!call) {
        RNCallKeep.endAllCalls()
        throw new Error("unknown_call")
    }

    if (call.status === "incoming") {
        throw new Error("missed_call")
    }

    if (Platform.OS === "ios") {
        RNCallKeep.reportEndCallWithUUID(call.uuid, 2);

        await endVideoCall(videoRoomSID);
    }
}

let appStateChangeSubscription: NativeEventSubscription | undefined;

async function doAnswerCall(callUUID: string) {
    const call = connectionManager.getCallByUUID(callUUID);

    if (!call) {
        console.warn(`cannot answer call: no call found with uuid ${callUUID}`);
        return;
    } else if (call.status === "answering") {
        console.info(`already answering call ${callUUID}`);
        return;
    }
    console.debug("[doAnswerCall]", {callUUID, call});
    call.status = "answering";

    RNCallKeep.answerIncomingCall(call.uuid);

    const {consultationID, videoRoomSID} = call;

    const response = await videoServiceApi.requestVideoCallAccess(videoRoomSID);

    const {accessToken} = response;

    const navigateOnActive = async (nextAppState: string) => {
        if (nextAppState !== "active") {
            return;
        }

        navigateOnAnswerCall(consultationID, videoRoomSID, accessToken);

        appStateChangeSubscription?.remove();
        appStateChangeSubscription = undefined;
    }

    if (AppState.currentState === "active") {
        navigateOnAnswerCall(consultationID, videoRoomSID, accessToken);
    } else {
        appStateChangeSubscription = AppState.addEventListener("change", navigateOnActive);
    }
}

export type CallEvent = {
    callUUID: string
    muted: boolean
    hold: boolean
}

type DelayedCallEvent = {
    name: string
    data: any
}

export class CallKeepEventHandlers {
    static async handleAnswerCall(event: CallEvent) {
        console.debug("[CallKeepEventHandlers:handleAnswerCall]", {callUUID: event.callUUID})
        await doAnswerCall(event.callUUID);
    }

    static handleDidPerformSetMutedCallAction(event: CallEvent) {
        const call = connectionManager.getCallByUUID(event.callUUID);

        if (!call) {
            console.warn(`cannot handle set muted call: no call found with uuid ${event.callUUID}`);
            return;
        }

        activeCallManager.setLocalAudioEnabled(event.muted)
            .catch((error: Error) => console.warn(`error muting call: ${error}`))
            .then(() => call.isCallMuted = event.muted);
    }

    static handleDidToggleHoldCallAction(event: CallEvent) {
        const call = connectionManager.getCallByUUID(event.callUUID);

        if (!call) {
            console.warn(`cannot handle toggle hold: no call found with uuid ${event.callUUID}`);
            return;
        }

        activeCallManager.setLocalVideoEnabled(!event.hold)
            .catch((error: Error) => console.warn(`error holding call: ${error}`))
            .then(() => call.isCallHeld = event.hold);
    }

    static async handleEndCall(event: CallEvent) {
        console.debug("[CallKeepEventHandlers:handleEndCall]", {callUUID: event.callUUID})

        const call = connectionManager.getCallByUUID(event.callUUID);

        if (!call) {
            console.info(`cannot end call: no call found with uuid ${event.callUUID}, but this may have already been handled`);
            return;
        }

        if (call.status === "in-progress") {
            await connectionManager.endVideoCall(call.videoRoomSID);
        } else if (call.status === "incoming") {
            await connectionManager.rejectVideoCall(call.videoRoomSID);
        }
    }

    static async handleDidLoadWithEvents(events: DelayedCallEvent[]): Promise<void> {
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

        const incomingPushKitVideoCallEvent = events.find(event => event.name === "incomingPushKitVideoCall");

        const canAnswerCall = registeredCall?.status === "incoming";

        if (canAnswerCall) {
            // This call was answered from the call UI, and we need to go to the call NOW
            await doAnswerCall(registeredCall.uuid);
        } else if (incomingPushKitVideoCallEvent) {
            const incomingCall = incomingPushKitVideoCallEvent!.data
            await connectionManager.registerPushKitCall(incomingCall)
            await doAnswerCall(incomingCall.uuid)
        }
    }
}

let answerablePushKitCallUUID: string;

export type PushKitCallNotification = {
    uuid?: string
    videoRoomSID: string
    callerDisplayName: string
    consultationID?: string
    callerPhotoURL?: string
    callerEmail?: string
    callerPhoneNumber?: string
}

type PushKitEvent = {
    data: PushKitCallNotification
}

export class PushKitEventHandlers {
    static handleOnRegister(token: string) {
        console.info("[PushKitEventHandlers:handleOnRegister]", token);
        HDConfig.ios.onRegisterPushKitToken(token);
    }

    static handleOnNotification(notification: PushKitCallNotification) {
        console.info("[PushKitEventHandlers:handleOnNotification]", notification);

        connectionManager.registerPushKitCall(notification)
            .catch(error => console.warn(`[PushKitEventHandlers:handleOnNotification:registerPushKitCall]`, error));
    }

    static handleOnDidLoadWithEvents(events: PushKitEvent[]) {
        console.debug("[PushKitEventHandlers:handleOnDidLoadWithEvents]")
        events.forEach((event) => console.debug("[PushKitEventHandlers:handleOnDidLoadWithEvents:EVENT]", event))
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
                .finally(() => answerablePushKitCallUUID = "");
        }
    }
}
