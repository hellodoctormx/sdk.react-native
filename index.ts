import * as auth from "./js/users/auth";
import {getCurrentUser} from "./js/users/auth";
import * as activeCallManager from "./js/telecom/activeCallManager";
import * as connectionManager from "./js/telecom/connectionManager";
import * as connectionService from "./js/telecom/connectionService";
import * as eventHandlers from "./js/telecom/eventHandlers";
import * as notifications from "./js/telecom/notifications";
import HDCallKeep from "./js/callkeep";
import HDVideoCall from "./js/components/HDVideoCall"
import HDVideoCallView from "./js/components/HDVideoCallView"
import HDVideoPermissionsConfiguration from "./js/components/HDVideoPermissionsConfiguration";
import HDIncomingVideoCallView from "./js/components/HDIncomingVideoCallView"
import PreviewLocalVideoView from "./js/components/PreviewLocalVideoView";
import usersServiceApi from "./js/api/users";
import videoServiceApi from "./js/api/video";
import withVideoCallPermissions from "./js/components/withVideoCallPermissions";
import Http from "./js/api/http";

class HDUsers {
    static createUser(accountPayload) {
        return usersServiceApi.createThirdPartyUserAccount(accountPayload)
    }

    static deleteUser(userID) {
        return usersServiceApi.deleteThirdPartyUserAccount(userID)
    }

    static updateMessagingToken(token) {
        const currentUser = getCurrentUser()

        if (currentUser === null) {
            console.warn("[HDUsers:updateMessagingToken] can't update: no current user");
            return;
        }

        return usersServiceApi.updateThirdPartyUserMessagingToken(currentUser.uid, currentUser.deviceID, token)
    }
}

class HDConsultations {
    static getConsultations(thirdPartyUserID, limit) {
        // TODO probably want to use hd user ID, but things are tangled up with the third-party ID at the moment

        // const currentUser = getCurrentUser()
        //
        // if (currentUser === null) {
        //     console.warn("[HDConsultations:getConsultations] can't get consultations: no current user");
        //     return;
        // }

        return usersServiceApi.getThirdPartyUserConsultations(thirdPartyUserID, limit);
    }
}

class HDVideoCalls {
    static handleIncomingVideoCallNotification(videoCallPayload) {
        return eventHandlers.handleIncomingVideoCall(videoCallPayload)
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
        return videoServiceApi
            .requestVideoCallAccess(videoRoomSID)
            .then(response => response.accessToken);
    }
}

export default class RNHelloDoctor {
    static appName: string = null
    static consultations: HDConsultations = HDConsultations
    static users: HDUsers = HDUsers
    static videos: HDVideoCalls = HDVideoCalls

    static async configure(appName, apiKey, config?: RNHelloDoctorConfig) {
        RNHelloDoctor.appName = appName;

        Http.API_KEY = apiKey;

        if (config !== undefined && config.user) {
            await auth.signIn(config.user.uid, config.user.deviceID, config.user.jwt, config.user.serverToken)
        }

        if (config !== undefined && config.video) {
            connectionService.bootstrap(config.video).catch(error => console.warn("[RNHelloDoctor:configure]", {error}));
        }
    }

    static teardown() {
        connectionService.teardown();
    }
}

export interface RNHelloDoctorConfig {
    user?: HDUserConfig,
    video: HDVideoCallsConfig
}

export interface HDUser {
    uid: string
    jwt?: string
    deviceID?: string
    isThirdParty: boolean
}

interface HDUserConfig extends HDUser {
    serverToken: string
}

interface HDVideoCallsConfig {
    onAnswerCall: Function,
    onEndCall: Function,
    onIncomingCall?: Function
}

export {
    connectionManager,
    notifications,
    HDCallKeep,
    HDIncomingVideoCallView,
    HDVideoCall,
    HDVideoCallView,
    HDVideoPermissionsConfiguration,
    PreviewLocalVideoView,
    withVideoCallPermissions
};
