import {Platform} from "react-native";
import VoipPushNotification from "react-native-voip-push-notification";
import RNCallKeep from "../callkeep";
import * as auth from "../users/auth";
import {CallKeepEventHandlers, PushKitEventHandlers} from "./eventHandlers";

let isCallsServiceBootstrapped = false;

export function bootstrap(): void {
    if (Platform.OS === "android") {
        return;
    }

    if (isCallsServiceBootstrapped) {
        console.info("[bootstrap] not bootstrapping: already bootstrapped");
        return;
    }

    registerCallEventListeners();

    isCallsServiceBootstrapped = true;
}

export function teardown(): void {
    auth.signOut();

    removeCallKeepListeners();
}

let hasRegisteredCallEventListeners = false;

export function registerCallEventListeners(): void {
    if (hasRegisteredCallEventListeners) {
        return;
    }

    RNCallKeep.addEventListener("answerCall", CallKeepEventHandlers.handleAnswerCall);
    RNCallKeep.addEventListener("didPerformSetMutedCallAction", CallKeepEventHandlers.handleDidPerformSetMutedCallAction);
    RNCallKeep.addEventListener("didToggleHoldCallAction", CallKeepEventHandlers.handleDidToggleHoldCallAction);
    RNCallKeep.addEventListener("endCall", CallKeepEventHandlers.handleEndCall);
    RNCallKeep.addEventListener("didLoadWithEvents", CallKeepEventHandlers.handleDidLoadWithEvents);

    setupPushKitEvents();

    hasRegisteredCallEventListeners = true;
}

export function removeCallKeepListeners(): void {
    RNCallKeep.removeEventListener("answerCall");
    RNCallKeep.removeEventListener("didPerformSetMutedCallAction");
    RNCallKeep.removeEventListener("didToggleHoldCallAction");
    RNCallKeep.removeEventListener("endCall");
    RNCallKeep.removeEventListener("didLoadWithEvents");

    if (Platform.OS === "ios") {
        VoipPushNotification.removeEventListener("register");
        VoipPushNotification.removeEventListener("notification");
        VoipPushNotification.removeEventListener("didLoadWithEvents");
    }

    hasRegisteredCallEventListeners = false;
}

function setupPushKitEvents(): void {
    VoipPushNotification.addEventListener("register", PushKitEventHandlers.handleOnRegister);
    VoipPushNotification.addEventListener("notification", PushKitEventHandlers.handleOnNotification);
    VoipPushNotification.addEventListener("didLoadWithEvents", PushKitEventHandlers.handleOnDidLoadWithEvents);
}
