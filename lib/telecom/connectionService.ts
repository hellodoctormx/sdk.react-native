import {EmitterSubscription, EventSubscription, NativeEventEmitter, NativeModules, Platform} from 'react-native';
import VoipPushNotification from 'react-native-voip-push-notification';
import * as auth from '../users/auth';
import {CallEvent, CallKeepEventHandlers, PushKitEventHandlers} from './eventHandlers';
import {hdEventEmitter} from '../ui/video/native';

let isCallsServiceBootstrapped = false;

const RNCallKeepPerformAnswerCallAction = 'RNCallKeepPerformAnswerCallAction';
const RNCallKeepPerformEndCallAction = 'RNCallKeepPerformEndCallAction';
const RNCallKeepDidPerformSetMutedCallAction = 'RNCallKeepDidPerformSetMutedCallAction';
const RNCallKeepDidToggleHoldAction = 'RNCallKeepDidToggleHoldAction';
const RNCallKeepDidLoadWithEvents = 'RNCallKeepDidLoadWithEvents';
const RNCallKeepDidChangeAudioRoute = 'RNCallKeepDidChangeAudioRoute';

export function bootstrap(): void {
    if (Platform.OS === 'android') {
        return;
    }

    if (isCallsServiceBootstrapped) {
        console.info('[bootstrap] not bootstrapping: already bootstrapped');
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

function handleDidChangeAudioRoute(event: CallEvent) {
    console.debug('[handleDidChangeAudioRoute]', {event});
}

const eventSubscriptions: EmitterSubscription[] = [];

function addEventListener(event: string, listener: (args: any) => void) {
    eventSubscriptions.push(hdEventEmitter.addListener(event, listener));
}

export function registerCallEventListeners(): void {
    console.debug('[registerCallEventListeners:EMITTER]', {hasRegisteredCallEventListeners});
    if (hasRegisteredCallEventListeners) {
        return;
    }

    addEventListener(RNCallKeepPerformAnswerCallAction, CallKeepEventHandlers.handleAnswerCall);
    addEventListener(RNCallKeepPerformEndCallAction, CallKeepEventHandlers.handleEndCall);
    addEventListener(RNCallKeepDidPerformSetMutedCallAction, CallKeepEventHandlers.handleDidPerformSetMutedCallAction);
    addEventListener(RNCallKeepDidToggleHoldAction, CallKeepEventHandlers.handleDidToggleHoldCallAction);
    addEventListener(RNCallKeepDidLoadWithEvents, CallKeepEventHandlers.handleDidLoadWithEvents);
    addEventListener(RNCallKeepDidChangeAudioRoute, handleDidChangeAudioRoute);

    addEventListener('incomingPushKitVideoCall', PushKitEventHandlers.handleOnNotification);
    VoipPushNotification.addEventListener('didLoadWithEvents', PushKitEventHandlers.handleOnDidLoadWithEvents);

    hasRegisteredCallEventListeners = true;
}

export function removeCallKeepListeners(): void {
    console.debug('[removeCallKeepListeners]');
    eventSubscriptions
        .map((subscription: EventSubscription) => subscription.remove())
        .forEach((index) => eventSubscriptions.pop());

    VoipPushNotification.removeEventListener('didLoadWithEvents');

    hasRegisteredCallEventListeners = false;
}
