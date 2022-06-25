import {NativeModules, Platform} from "react-native";
import Http from "./api/http";
import consultationsAPI from "./api/consultations";
import schedulingAPI from "./api/scheduling";
import usersAPI from "./api/users";
import videoAPI from "./api/video";
import * as activeCallManager from "./telecom/activeCallManager";
import * as connectionManager from "./telecom/connectionManager";
import * as connectionService from "./telecom/connectionService";
import * as eventHandlers from "./telecom/eventHandlers";
import * as auth from "./users/auth";
import {getCurrentUser} from "./users/currentUser";
import HDConfig, {HDConfigOptions} from "./HDConfig";

const {RNHelloDoctorModule} = NativeModules;

export default class RNHelloDoctor {
    static appName: string = null

    static async configure(config?: HDConfigOptions) {
        RNHelloDoctor.appName = config.appName;

        Object.assign(HDConfig, config);

        Http.API_KEY = config.apiKey;

        if (Platform.OS === "android") {
            await RNHelloDoctorModule.configure(config.apiKey, config.serviceHost);
        }
    }

    static async signIn(userID, serverAuthToken) {
        await auth.signIn(userID, serverAuthToken);

        if (Platform.OS === "ios") {
            connectionService.bootstrap();
        }
    }

    static async signInWithJWT(userID, jwt) {
        await auth.signInWithJWT(userID, jwt);

        if (Platform.OS === "ios") {
            connectionService.bootstrap();
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

    // SCHEDULING & CONSULTATION FUNCTIONS
    static getAvailability(requestMode, specialty, fromTime, toTime) {
        return schedulingAPI.getAvailability(requestMode, specialty, fromTime, toTime);
    }

    static requestConsultation(requestMode, specialty, startTime, reason) {
        return schedulingAPI.requestConsultation(requestMode, specialty, startTime, reason);
    }

    static getConsultations(limit) {
        return consultationsAPI.getUserConsultations(limit);
    }

    // VIDEO CALL FUNCTIONS
    static handleIncomingVideoCallNotification(videoCallPayload) {
        const {videoRoomSID, callerDisplayName, callerPhotoURL} = videoCallPayload;

        return activeCallManager.displayIncomingCallNotification(videoRoomSID, callerDisplayName, callerPhotoURL);
    }

    static handleIncomingVideoCallNotificationRejected() {
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
