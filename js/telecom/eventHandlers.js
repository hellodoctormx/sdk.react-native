"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushKitEventHandlers = exports.CallKeepEventHandlers = exports.handleVideoCallEndedNotification = exports.handleIncomingVideoCallEndedRemotely = exports.handleIncomingVideoCallNotification = exports.navigateOnEndCall = exports.navigateOnAnswerCall = void 0;
var react_native_1 = require("react-native");
var video_1 = require("../api/video");
var callkeep_1 = require("../callkeep");
var connectionManager = require("./connectionManager");
var connectionManager_1 = require("./connectionManager");
var activeCallManager = require("./activeCallManager");
var HDConfig_1 = require("../HDConfig");
var RNHelloDoctorModule = react_native_1.NativeModules.RNHelloDoctorModule;
function navigateOnAnswerCall(consultationID, videoRoomSID, accessToken) {
    HDConfig_1.default.onAnswerCall(consultationID, videoRoomSID, accessToken);
}
exports.navigateOnAnswerCall = navigateOnAnswerCall;
function navigateOnEndCall(consultationID, videoRoomSID) {
    HDConfig_1.default.onEndCall(consultationID, videoRoomSID);
}
exports.navigateOnEndCall = navigateOnEndCall;
function handleIncomingVideoCallNotification(videoRoomSID, callerDisplayName, callerPhotoURL) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, connectionManager.registerIncomingVideoCall(null, videoRoomSID, null, { displayName: callerDisplayName })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, activeCallManager.displayIncomingCallNotification(videoRoomSID, callerDisplayName, callerPhotoURL)];
            }
        });
    });
}
exports.handleIncomingVideoCallNotification = handleIncomingVideoCallNotification;
// deprecated: use handleVideoCallEndedNotification
function handleIncomingVideoCallEndedRemotely(videoRoomSID) {
    return __awaiter(this, void 0, void 0, function () {
        var call;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    call = connectionManager.getIncomingCall();
                    if (!call) {
                        console.warn("no call found for room ".concat(videoRoomSID));
                        return [2 /*return*/];
                    }
                    callkeep_1.default.reportEndCallWithUUID(call.uuid, 2);
                    return [4 /*yield*/, (0, connectionManager_1.endVideoCall)(videoRoomSID)];
                case 1:
                    _a.sent();
                    (0, connectionManager_1.tryCancelVideoCallNotification)(videoRoomSID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.handleIncomingVideoCallEndedRemotely = handleIncomingVideoCallEndedRemotely;
function handleVideoCallEndedNotification(videoRoomSID) {
    return __awaiter(this, void 0, void 0, function () {
        var call;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, connectionManager_1.tryCancelVideoCallNotification)(videoRoomSID);
                    call = connectionManager.getIncomingCall();
                    if (!call) {
                        callkeep_1.default.endAllCalls();
                        throw new Error("unknown_call");
                    }
                    if (call.status === "incoming") {
                        throw new Error("missed_call");
                    }
                    if (!(react_native_1.Platform.OS === "ios")) return [3 /*break*/, 2];
                    callkeep_1.default.reportEndCallWithUUID(call.uuid, 2);
                    return [4 /*yield*/, (0, connectionManager_1.endVideoCall)(videoRoomSID)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
exports.handleVideoCallEndedNotification = handleVideoCallEndedNotification;
var appStateChangeEventSubscriber = null;
function doAnswerCall(callUUID) {
    return __awaiter(this, void 0, void 0, function () {
        var call, consultationID, videoRoomSID, response, accessToken, navigateOnActive;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    call = connectionManager.getCallByUUID(callUUID);
                    if (!call) {
                        console.warn("cannot answer call: no call found with uuid ".concat(callUUID));
                        return [2 /*return*/];
                    }
                    else if (call.status === "answering") {
                        console.info("already answering call ".concat(callUUID));
                        return [2 /*return*/];
                    }
                    call.status = "answering";
                    callkeep_1.default.answerIncomingCall(call.uuid);
                    consultationID = call.consultationID, videoRoomSID = call.videoRoomSID;
                    return [4 /*yield*/, video_1.default.requestVideoCallAccess(videoRoomSID)];
                case 1:
                    response = _a.sent();
                    accessToken = response.accessToken;
                    navigateOnActive = function (nextAppState) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            if (nextAppState !== "active") {
                                return [2 /*return*/];
                            }
                            navigateOnAnswerCall(consultationID, videoRoomSID, accessToken);
                            appStateChangeEventSubscriber === null || appStateChangeEventSubscriber === void 0 ? void 0 : appStateChangeEventSubscriber.remove();
                            appStateChangeEventSubscriber = null;
                            return [2 /*return*/];
                        });
                    }); };
                    if (react_native_1.AppState.currentState === "active") {
                        navigateOnAnswerCall(consultationID, videoRoomSID, accessToken);
                    }
                    else {
                        appStateChangeEventSubscriber = react_native_1.AppState.addEventListener("change", navigateOnActive);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
var CallKeepEventHandlers = /** @class */ (function () {
    function CallKeepEventHandlers() {
    }
    CallKeepEventHandlers.handleAnswerCall = function (_a) {
        var callUUID = _a.callUUID;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, doAnswerCall(callUUID)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CallKeepEventHandlers.handleDidPerformSetMutedCallAction = function (_a) {
        var callUUID = _a.callUUID, muted = _a.muted;
        var call = connectionManager.getCallByUUID(callUUID);
        if (!call) {
            console.warn("cannot handle set muted call: no call found with uuid ".concat(callUUID));
            return;
        }
        activeCallManager.setLocalAudioEnabled(muted)
            .catch(function (error) { return console.warn("error muting call: ".concat(error)); })
            .then(function () { return call.isCallMuted = muted; });
    };
    CallKeepEventHandlers.handleDidToggleHoldCallAction = function (_a) {
        var callUUID = _a.callUUID, hold = _a.hold;
        var call = connectionManager.getCallByUUID(callUUID);
        if (!call) {
            console.warn("cannot handle toggle hold: no call found with uuid ".concat(callUUID));
            return;
        }
        activeCallManager.setLocalVideoEnabled(!hold)
            .catch(function (error) { return console.warn("error holding call: ".concat(error)); })
            .then(function () { return call.isCallHeld = hold; });
    };
    CallKeepEventHandlers.handleEndCall = function (_a) {
        var callUUID = _a.callUUID;
        return __awaiter(this, void 0, void 0, function () {
            var call;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        call = connectionManager.getCallByUUID(callUUID);
                        if (!call) {
                            console.info("cannot end call: no call found with uuid ".concat(callUUID, ", but this may have already been handled"));
                            return [2 /*return*/];
                        }
                        if (!(call.status === "in-progress")) return [3 /*break*/, 2];
                        return [4 /*yield*/, connectionManager.endVideoCall(call.videoRoomSID)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(call.status === "incoming")) return [3 /*break*/, 4];
                        return [4 /*yield*/, connectionManager.rejectVideoCall(call.videoRoomSID)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CallKeepEventHandlers.handleDidLoadWithEvents = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            var answeredCallAction, answeredCallUUID, registeredCall, canAnswerCall;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        answeredCallAction = events.find(function (event) { return event.name === "RNCallKeepPerformAnswerCallAction"; });
                        if (!answeredCallAction) {
                            return [2 /*return*/];
                        }
                        answeredCallUUID = answeredCallAction.data.callUUID;
                        registeredCall = connectionManager.getCallByUUID(answeredCallUUID);
                        if (registeredCall && registeredCall.status !== "incoming") {
                            // This call has already been handled
                            return [2 /*return*/];
                        }
                        canAnswerCall = (registeredCall === null || registeredCall === void 0 ? void 0 : registeredCall.status) === "incoming";
                        if (!canAnswerCall) return [3 /*break*/, 2];
                        // This call was answered from the call UI, and we need to go to the call NOW
                        return [4 /*yield*/, doAnswerCall(registeredCall.uuid)];
                    case 1:
                        // This call was answered from the call UI, and we need to go to the call NOW
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        if (!registeredCall) {
                            // Very likely PushKit displayed the call, but it hasn't yet been registered. Let PushKit know to navigate to this call
                            answerablePushKitCallUUID = answeredCallUUID;
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CallKeepEventHandlers;
}());
exports.CallKeepEventHandlers = CallKeepEventHandlers;
var answerablePushKitCallUUID = null;
var PushKitEventHandlers = /** @class */ (function () {
    function PushKitEventHandlers() {
    }
    PushKitEventHandlers.handleOnRegister = function (token) {
        HDConfig_1.default.ios.onRegisterPushKitToken(token);
    };
    PushKitEventHandlers.handleOnNotification = function (notification) {
        console.info("[PushKitEventHandlers:handleOnNotification]", notification);
        connectionManager.registerPushKitCall(notification)
            .catch(function (error) { return console.warn("[PushKitEventHandlers:handleOnNotification:registerPushKitCall]", error); });
    };
    PushKitEventHandlers.handleOnDidLoadWithEvents = function (events) {
        console.debug("[PushKitEventHandlers:handleOnDidLoadWithEvents]");
        events.forEach(function (event) { return console.debug("[PushKitEventHandlers:handleOnDidLoadWithEvents:EVENT]", event); });
        var incomingCallNotificationEvent = events.find(function (e) { var _a; return !!((_a = e.data) === null || _a === void 0 ? void 0 : _a.videoRoomSID); });
        if (!incomingCallNotificationEvent) {
            return;
        }
        var incomingCallData = incomingCallNotificationEvent.data;
        var uuid = incomingCallNotificationEvent.data.uuid;
        var existingIncomingCall = connectionManager.getCallByUUID(uuid);
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
                .catch(function (error) { return console.warn("[PushKitEventHandlers:handleOnDidLoadWithEvents:doAnswerCall]", error); })
                .finally(function () { return answerablePushKitCallUUID = null; });
        }
    };
    return PushKitEventHandlers;
}());
exports.PushKitEventHandlers = PushKitEventHandlers;
