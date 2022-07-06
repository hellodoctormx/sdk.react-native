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
exports.registerPushKitCall = exports.rejectVideoCall = exports.endVideoCall = exports.tryCancelVideoCallNotification = exports.handleIncomingVideoCallStarted = exports.registerIncomingVideoCall = exports.getIncomingCall = exports.getActiveCall = exports.getCallByUUID = void 0;
var react_native_uuid_generator_1 = require("react-native-uuid-generator");
var react_native_1 = require("@notifee/react-native");
var callkeep_1 = require("../callkeep");
var video_1 = require("../api/video");
var eventHandlers_1 = require("./eventHandlers");
var react_native_2 = require("react-native");
var RNHelloDoctorModule = react_native_2.NativeModules.RNHelloDoctorModule;
var calls = [];
var getNewCallUUID = function () { return __awaiter(void 0, void 0, void 0, function () {
    var callUUID;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, react_native_uuid_generator_1.default.getRandomUUID()];
            case 1:
                callUUID = _a.sent();
                // have to toLowerCase because CallKeep internally lower cases that shit for whatever reason
                return [2 /*return*/, callUUID.toLowerCase()];
        }
    });
}); };
function getCallByUUID(uuid) {
    return calls.find(function (c) { return c.uuid = uuid; });
}
exports.getCallByUUID = getCallByUUID;
function getActiveCall() {
    return calls.find(function (c) { return c.status === "in-progress"; });
}
exports.getActiveCall = getActiveCall;
function getIncomingCall() {
    return calls.find(function (c) { return c.status === "incoming"; }) || getActiveCall();
}
exports.getIncomingCall = getIncomingCall;
function registerIncomingVideoCall(uuid, videoRoomSID, consultationID, caller) {
    return __awaiter(this, void 0, void 0, function () {
        var call, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = {};
                    _a = uuid;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, getNewCallUUID()];
                case 1:
                    _a = (_c.sent());
                    _c.label = 2;
                case 2:
                    call = (_b.uuid = _a,
                        _b.videoRoomSID = videoRoomSID,
                        _b.consultationID = consultationID,
                        _b.caller = caller,
                        _b.status = "incoming",
                        _b.isCallMuted = false,
                        _b.isCallHeld = false,
                        _b);
                    calls.push(call);
                    return [2 /*return*/, call];
            }
        });
    });
}
exports.registerIncomingVideoCall = registerIncomingVideoCall;
function handleIncomingVideoCallStarted(videoRoomSID) {
    var call = calls.find(function (c) { return c.videoRoomSID === videoRoomSID; });
    if (!call) {
        console.warn("[handleIncomingVideoCallStarted] cannot start ".concat(videoRoomSID, ": no call found"));
        return;
    }
    call.status = "in-progress";
}
exports.handleIncomingVideoCallStarted = handleIncomingVideoCallStarted;
var incomingCallNotificationIDs = {};
function tryCancelVideoCallNotification(videoRoomSID) {
    if (react_native_2.Platform.OS === "android") {
        RNHelloDoctorModule.cancelIncomingCallNotification();
    }
    else {
        var incomingCallNotificationID = incomingCallNotificationIDs[videoRoomSID];
        if (incomingCallNotificationID) {
            react_native_1.default.cancelNotification(incomingCallNotificationID).catch(console.warn);
        }
    }
}
exports.tryCancelVideoCallNotification = tryCancelVideoCallNotification;
function endVideoCall(videoRoomSID) {
    return __awaiter(this, void 0, void 0, function () {
        var call;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    call = calls.find(function (c) { return c.videoRoomSID === videoRoomSID; });
                    if (!call) {
                        console.warn("no call found for room ".concat(videoRoomSID));
                        return [2 /*return*/];
                    }
                    callkeep_1.default.endCall(call.uuid);
                    if (call.status === "completed") {
                        console.info("[endConsultationVideoCall:".concat(videoRoomSID, "]: call has already been completed"));
                        return [2 /*return*/];
                    }
                    call.status = "completed";
                    return [4 /*yield*/, video_1.default.endVideoCall(videoRoomSID).catch(function (error) { return console.warn("error ending video call ".concat(videoRoomSID), error); })];
                case 1:
                    _a.sent();
                    (0, eventHandlers_1.navigateOnEndCall)(call.consultationID, videoRoomSID);
                    return [2 /*return*/];
            }
        });
    });
}
exports.endVideoCall = endVideoCall;
function rejectVideoCall(videoRoomSID) {
    return __awaiter(this, void 0, void 0, function () {
        var call;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    call = calls.find(function (c) { return c.videoRoomSID === videoRoomSID; });
                    if (!call) {
                        console.warn("no call found for room ".concat(videoRoomSID));
                        return [2 /*return*/];
                    }
                    call.status = "completed";
                    return [4 /*yield*/, video_1.default.endVideoCall(videoRoomSID)];
                case 1:
                    _a.sent();
                    callkeep_1.default.rejectCall(call.uuid);
                    return [2 /*return*/];
            }
        });
    });
}
exports.rejectVideoCall = rejectVideoCall;
function registerPushKitCall(notification) {
    return __awaiter(this, void 0, void 0, function () {
        var uuid, videoRoomSID, consultationID, callerDisplayName, callerPhoneNumber, callerEmail, existingCall, caller;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    uuid = notification.uuid, videoRoomSID = notification.videoRoomSID, consultationID = notification.consultationID, callerDisplayName = notification.callerDisplayName, callerPhoneNumber = notification.callerPhoneNumber, callerEmail = notification.callerEmail;
                    existingCall = calls.find(function (c) { return c.videoRoomSID === videoRoomSID; });
                    if (existingCall) {
                        console.info("already have call existing incoming call, skipping", existingCall);
                        return [2 /*return*/];
                    }
                    caller = {
                        displayName: callerDisplayName,
                        phoneNumber: callerPhoneNumber,
                        email: callerEmail
                    };
                    return [4 /*yield*/, registerIncomingVideoCall(uuid, videoRoomSID, consultationID, caller)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.registerPushKitCall = registerPushKitCall;
