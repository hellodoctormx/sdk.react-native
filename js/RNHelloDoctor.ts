import {NativeModules, Platform} from "react-native";
import Http from "./api/http";
import consultationsAPI from "./api/consultations";
import usersAPI from "./api/users";
import videoAPI from "./api/video";
import * as activeCallManager from "./telecom/activeCallManager";
import * as connectionManager from "./telecom/connectionManager";
import * as connectionService from "./telecom/connectionService";
import * as eventHandlers from "./telecom/eventHandlers";
import * as auth from "./users/auth";
import {getCurrentUser} from "./users/currentUser";

const {RNHelloDoctorModule} = NativeModules;

export default class RNHelloDoctor {
    static appName: string = null
    static videoNavigationConfig: HDVideoNavigationConfig = null

    static async configure(appName, apiKey, serviceHost, videoNavigationConfig?: HDVideoNavigationConfig) {
        RNHelloDoctor.appName = appName;
        RNHelloDoctor.videoNavigationConfig = videoNavigationConfig;

        Http.API_KEY = apiKey;

        if (Platform.OS === "android") {
            await RNHelloDoctorModule.configure(apiKey, serviceHost);
        }
    }

    static async signIn(userID, deviceID, serverAuthToken) {
        await auth.signIn(userID, deviceID, serverAuthToken);

        if (Platform.OS === "ios") {
            connectionService.bootstrap(RNHelloDoctor.videoNavigationConfig);
        }
    }

    static async signInWithJWT(userID, deviceID, jwt) {
        await auth.signInWithJWT(userID, deviceID, jwt);

        if (Platform.OS === "ios") {
            connectionService.bootstrap(RNHelloDoctor.videoNavigationConfig);
        }
    }

    static teardown() {
        connectionService.teardown();
    }

    // USER FUNCTIONS
    static getCurrentUser() {
        return getCurrentUser()
    }

    static createUser(accountPayload) {
        return usersAPI.createUser(accountPayload)
    }

    static deleteUser(userID) {
        return usersAPI.deleteUser(userID)
    }

    static updateMessagingToken(token) {
        const currentUser = getCurrentUser()

        if (currentUser === null) {
            console.warn("[HDUsers:updateMessagingToken] can't update: no current user");
            return;
        }

        return usersAPI.updateThirdPartyUserMessagingToken(currentUser.deviceID, token)
    }

    // SCHEDULING FUNCTIONS
    static getConsultations(limit) {
        return consultationsAPI.getUserConsultations(limit);
    }

    // VIDEO CALL FUNCTIONS
    static handleIncomingVideoCallNotification(videoCallPayload) {
        const {videoRoomSID, callerDisplayName, callerPhotoURL} = videoCallPayload;

        return activeCallManager.displayIncomingCallNotification(videoRoomSID, callerDisplayName, callerPhotoURL);
    }

    static handleIncomingVideoCallNotificationRejected() {
        activeCallManager.stopNotificationAlerts();

        const incomingCall = connectionManager.getIncomingCall();

        if (!incomingCall) {
            return;
        }

        connectionManager.rejectVideoCall(incomingCall.videoRoomSID).catch(console.warn);
    }

    static handleIncomingVideoCallEndedRemotely(videoRoomSID) {
        return eventHandlers.handleIncomingVideoCallEndedRemotely(videoRoomSID);
    }

    static startVideoCall(videoRoomSID) {
        connectionManager.handleIncomingVideoCallStarted(videoRoomSID);
    }

    static endVideoCall(videoRoomSID) {
        return connectionManager.endVideoCall(videoRoomSID)
    }

    static getVideoCallAccessToken(videoRoomSID) {
        return videoAPI
            .requestVideoCallAccess(videoRoomSID)
            .then(response => response.accessToken);
    }
}

interface HDVideoNavigationConfig {
    onAnswerCall: Function,
    onEndCall: Function,
    onIncomingCall?: Function
}
