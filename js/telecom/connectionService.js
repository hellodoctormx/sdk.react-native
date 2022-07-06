"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCallKeepListeners = exports.registerCallEventListeners = exports.teardown = exports.bootstrap = void 0;
var react_native_1 = require("react-native");
var react_native_voip_push_notification_1 = require("react-native-voip-push-notification");
var callkeep_1 = require("../callkeep");
var auth = require("../users/auth");
var eventHandlers_1 = require("./eventHandlers");
var isCallsServiceBootstrapped = false;
function bootstrap() {
    if (react_native_1.Platform.OS === "android") {
        return;
    }
    if (isCallsServiceBootstrapped) {
        console.info("[bootstrap] not bootstrapping: already bootstrapped");
        return;
    }
    registerCallEventListeners();
    isCallsServiceBootstrapped = true;
}
exports.bootstrap = bootstrap;
function teardown() {
    auth.signOut();
    removeCallKeepListeners();
}
exports.teardown = teardown;
var hasRegisteredCallEventListeners = false;
function registerCallEventListeners() {
    if (hasRegisteredCallEventListeners) {
        return;
    }
    callkeep_1.default.addEventListener("answerCall", eventHandlers_1.CallKeepEventHandlers.handleAnswerCall);
    callkeep_1.default.addEventListener("didPerformSetMutedCallAction", eventHandlers_1.CallKeepEventHandlers.handleDidPerformSetMutedCallAction);
    callkeep_1.default.addEventListener("didToggleHoldCallAction", eventHandlers_1.CallKeepEventHandlers.handleDidToggleHoldCallAction);
    callkeep_1.default.addEventListener("endCall", eventHandlers_1.CallKeepEventHandlers.handleEndCall);
    callkeep_1.default.addEventListener("didLoadWithEvents", eventHandlers_1.CallKeepEventHandlers.handleDidLoadWithEvents);
    setupPushKitEvents();
    hasRegisteredCallEventListeners = true;
}
exports.registerCallEventListeners = registerCallEventListeners;
function removeCallKeepListeners() {
    callkeep_1.default.removeEventListener("answerCall");
    callkeep_1.default.removeEventListener("didPerformSetMutedCallAction");
    callkeep_1.default.removeEventListener("didToggleHoldCallAction");
    callkeep_1.default.removeEventListener("endCall");
    callkeep_1.default.removeEventListener("didLoadWithEvents");
    if (react_native_1.Platform.OS === "ios") {
        react_native_voip_push_notification_1.default.removeEventListener("register");
        react_native_voip_push_notification_1.default.removeEventListener("notification");
        react_native_voip_push_notification_1.default.removeEventListener("didLoadWithEvents");
    }
    hasRegisteredCallEventListeners = false;
}
exports.removeCallKeepListeners = removeCallKeepListeners;
function setupPushKitEvents() {
    react_native_voip_push_notification_1.default.addEventListener("register", eventHandlers_1.PushKitEventHandlers.handleOnRegister);
    react_native_voip_push_notification_1.default.addEventListener("notification", eventHandlers_1.PushKitEventHandlers.handleOnNotification);
    react_native_voip_push_notification_1.default.addEventListener("didLoadWithEvents", eventHandlers_1.PushKitEventHandlers.handleOnDidLoadWithEvents);
}
