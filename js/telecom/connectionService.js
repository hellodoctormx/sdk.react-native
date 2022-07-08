import {EventSubscription, NativeEventEmitter, NativeModules, Platform} from "react-native";
import VoipPushNotification from "react-native-voip-push-notification";
import * as auth from "../users/auth";
import {CallKeepEventHandlers, PushKitEventHandlers} from "./eventHandlers";

let isCallsServiceBootstrapped = false;

const eventEmitter = new NativeEventEmitter(NativeModules.RNHelloDoctorModule);

const RNCallKeepPerformAnswerCallAction = 'RNCallKeepPerformAnswerCallAction';
const RNCallKeepPerformEndCallAction = 'RNCallKeepPerformEndCallAction';
const RNCallKeepDidPerformSetMutedCallAction = 'RNCallKeepDidPerformSetMutedCallAction';
const RNCallKeepDidToggleHoldAction = 'RNCallKeepDidToggleHoldAction';
const RNCallKeepDidLoadWithEvents = 'RNCallKeepDidLoadWithEvents';
const RNCallKeepDidChangeAudioRoute = 'RNCallKeepDidChangeAudioRoute';

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

function handleDidChangeAudioRoute(events) {
    console.debug("[handleDidChangeAudioRoute]", {events})
}

const eventSubscriptions = []

function addEventListener(event, listener) {
    eventSubscriptions.push(eventEmitter.addListener(event, listener))
}

export function registerCallEventListeners(): void {
    console.debug("[registerCallEventListeners]", {hasRegisteredCallEventListeners})
    if (hasRegisteredCallEventListeners) {
        return;
    }

    eventEmitter.addListener(RNCallKeepPerformAnswerCallAction, CallKeepEventHandlers.handleAnswerCall)
    eventEmitter.addListener(RNCallKeepPerformEndCallAction, CallKeepEventHandlers.handleEndCall)
    eventEmitter.addListener(RNCallKeepDidPerformSetMutedCallAction, CallKeepEventHandlers.handleDidPerformSetMutedCallAction)
    eventEmitter.addListener(RNCallKeepDidToggleHoldAction, CallKeepEventHandlers.handleDidToggleHoldCallAction)
    eventEmitter.addListener(RNCallKeepDidLoadWithEvents, CallKeepEventHandlers.handleDidLoadWithEvents)
    addEventListener(RNCallKeepDidChangeAudioRoute, handleDidChangeAudioRoute)

    VoipPushNotification.addEventListener("register", PushKitEventHandlers.handleOnRegister);
    VoipPushNotification.addEventListener("notification", PushKitEventHandlers.handleOnNotification);
    VoipPushNotification.addEventListener("didLoadWithEvents", PushKitEventHandlers.handleOnDidLoadWithEvents);

    hasRegisteredCallEventListeners = true;
}

export function removeCallKeepListeners(): void {
    console.debug("[removeCallKeepListeners]")
    eventSubscriptions
        .map((subscription: EventSubscription) => subscription.remove())
        .forEach((index) => eventSubscriptions.pop())

    VoipPushNotification.removeEventListener("register");
    VoipPushNotification.removeEventListener("notification");
    VoipPushNotification.removeEventListener("didLoadWithEvents");

    hasRegisteredCallEventListeners = false;
}
