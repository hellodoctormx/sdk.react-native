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

export default class RNHelloDoctor {
    static appName: string = null

    static configure(appName, apiKey, videoNavigationConfig?: HDVideoNavigationConfig) {
        RNHelloDoctor.appName = appName;

        Http.API_KEY = apiKey;

        if (videoNavigationConfig) {
            connectionService.bootstrap(videoNavigationConfig);
        }
    }

    static async signIn(userID, deviceID, serverAuthToken) {
        await auth.signIn(userID, deviceID, serverAuthToken)
    }

    static async signInWithJWT(userID, deviceID, jwt) {
        await auth.signInWithJWT(userID, deviceID, jwt);
    }

    static teardown() {
        connectionService.teardown();
    }

    // USER FUNCTIONS
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

        return usersAPI.updateThirdPartyUserMessagingToken(currentUser.uid, currentUser.deviceID, token)
    }

    // SCHEDULING FUNCTIONS
    static getConsultations(limit) {
        return consultationsAPI.getUserConsultations(limit);
    }

    // VIDEO CALL FUNCTIONS
    static handleIncomingVideoCallNotification(videoCallPayload) {
        console.info("[HDVideoCalls:handleIncomingVideoCallNotification]", {videoCallPayload});
        const {videoRoomSID, callerDisplayName} = videoCallPayload;

        return activeCallManager.displayIncomingCallNotification(videoRoomSID, callerDisplayName);
    }

    static handleIncomingVideoCallNotificationRejected() {
        console.info("[HDVideoCalls:handleIncomingVideoCallNotificationRejected]");

        activeCallManager.stopNotificationAlerts();

        const incomingCall = connectionManager.getIncomingCall();

        if (!incomingCall) {
            console.info("[HDVideoCalls:handleIncomingVideoCallNotificationRejected] cannot reject incoming call: none found");
            return;
        }

        connectionManager.rejectVideoCall(incomingCall.videoRoomSID).catch(console.warn);
    }

    static handleIncomingVideoCallEndedRemotely(videoCallPayload) {
        return eventHandlers.handleIncomingVideoCallEndedRemotely(videoCallPayload);
    }

    static startVideoCall(videoRoomSID) {
        connectionManager.handleIncomingVideoCallStarted(videoRoomSID);

        const listener = status => {
            switch (status) {
                case "completed":
                case "rejected":
                    this.endVideoCall(videoRoomSID).catch(console.warn);
                    break;
            }
        }

        connectionManager.registerCallStatusListener(videoRoomSID, listener);
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
