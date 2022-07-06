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
var react_native_1 = require("react-native");
var http_1 = require("./api/http");
var consultations_1 = require("./api/consultations");
var scheduling_1 = require("./api/scheduling");
var users_1 = require("./api/users");
var video_1 = require("./api/video");
var connectionManager = require("./telecom/connectionManager");
var connectionService = require("./telecom/connectionService");
var eventHandlers = require("./telecom/eventHandlers");
var auth = require("./users/auth");
var currentUser_1 = require("./users/currentUser");
var HDConfig_1 = require("./HDConfig");
var RNHelloDoctorModule = react_native_1.NativeModules.RNHelloDoctorModule;
function deprecated() {
}
var RNHelloDoctor = /** @class */ (function () {
    function RNHelloDoctor() {
    }
    RNHelloDoctor.configure = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        RNHelloDoctor.appName = config.appName;
                        Object.assign(HDConfig_1.default, config);
                        http_1.default.API_KEY = config.apiKey;
                        _a = react_native_1.Platform.OS;
                        switch (_a) {
                            case "android": return [3 /*break*/, 1];
                            case "ios": return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, RNHelloDoctorModule.configure(config.apiKey, config.serviceHost)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, RNHelloDoctorModule.getAPNSToken().then(HDConfig_1.default.ios.onRegisterPushKitToken)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    RNHelloDoctor.signIn = function (userID, serverAuthToken) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, auth.signIn(userID, serverAuthToken)];
                    case 1:
                        _a.sent();
                        if (react_native_1.Platform.OS === "ios") {
                            connectionService.bootstrap();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    RNHelloDoctor.signInWithJWT = function (userID, jwt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, auth.signInWithJWT(userID, jwt)];
                    case 1:
                        _a.sent();
                        if (react_native_1.Platform.OS === "ios") {
                            connectionService.bootstrap();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    RNHelloDoctor.teardown = function () {
        connectionService.teardown();
    };
    // USER FUNCTIONS
    RNHelloDoctor.getCurrentUser = function () {
        return (0, currentUser_1.getCurrentUser)();
    };
    RNHelloDoctor.createUser = function (accountPayload) {
        return users_1.default.createUser(accountPayload);
    };
    RNHelloDoctor.deleteUser = function (userID) {
        return users_1.default.deleteUser(userID);
    };
    // SCHEDULING & CONSULTATION FUNCTIONS
    RNHelloDoctor.getAvailability = function (requestMode, specialty, fromTime, toTime) {
        return scheduling_1.default.getAvailability(requestMode, specialty, fromTime, toTime);
    };
    RNHelloDoctor.requestConsultation = function (requestMode, specialty, startTime, reason) {
        return scheduling_1.default.requestConsultation(requestMode, specialty, startTime, reason);
    };
    RNHelloDoctor.getConsultations = function (limit) {
        return consultations_1.default.getUserConsultations(limit);
    };
    // VIDEO CALL FUNCTIONS
    RNHelloDoctor.handleIncomingVideoCallNotification = function (videoCallPayload) {
        var videoRoomSID = videoCallPayload.videoRoomSID, callerDisplayName = videoCallPayload.callerDisplayName, callerPhotoURL = videoCallPayload.callerPhotoURL;
        return eventHandlers.handleIncomingVideoCallNotification(videoRoomSID, callerDisplayName, callerPhotoURL);
    };
    RNHelloDoctor.handleIncomingVideoCallNotificationRejected = function () {
        var incomingCall = connectionManager.getIncomingCall();
        if (!incomingCall) {
            return;
        }
        connectionManager.rejectVideoCall(incomingCall.videoRoomSID).catch(console.warn);
    };
    // deprecated: use handleVideoCallEndedNotification
    RNHelloDoctor.handleIncomingVideoCallEndedRemotely = function (videoRoomSID) {
        return eventHandlers.handleIncomingVideoCallEndedRemotely(videoRoomSID);
    };
    RNHelloDoctor.handleVideoCallEndedNotification = function (videoRoomSID) {
        return eventHandlers.handleVideoCallEndedNotification(videoRoomSID);
    };
    RNHelloDoctor.startVideoCall = function (videoRoomSID) {
        connectionManager.handleIncomingVideoCallStarted(videoRoomSID);
    };
    RNHelloDoctor.endVideoCall = function (videoRoomSID) {
        return connectionManager.endVideoCall(videoRoomSID);
    };
    RNHelloDoctor.getVideoCallAccessToken = function (videoRoomSID) {
        return video_1.default
            .requestVideoCallAccess(videoRoomSID)
            .then(function (response) { return response.accessToken; });
    };
    RNHelloDoctor.appName = null;
    return RNHelloDoctor;
}());
exports.default = RNHelloDoctor;
