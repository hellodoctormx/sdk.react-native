import * as auth from "./js/users/auth";
import * as connectionManager from "./js/telecom/connectionManager";
import * as connectionService from "./js/telecom/connectionService";
import * as eventHandlers from "./js/telecom/eventHandlers";
import * as notifications from "./js/telecom/notifications";
import HDCallKeep from "./js/callkeep";
import HDVideoCallRenderer from "./js/components/HDVideoCallRenderer"
import HDVideoPermissionsConfiguration from "./js/components/HDVideoPermissionsConfiguration";
import HDIncomingVideoCall from "./js/components/HDIncomingVideoCall"
import PreviewLocalVideoView from "./js/components/PreviewLocalVideoView";
import usersServiceApi from "./js/api/users";
import videoServiceApi from "./js/api/video";
import withVideoCallPermissions from "./js/components/withVideoCallPermissions";
import {getCurrentUser} from "./js/users/auth";

export default class RNHelloDoctor {
    static videos: HDVideoCalls = null

    static configure(config: RNHelloDoctorConfig) {
        auth.signIn(config.user)

        connectionService.bootstrap(config.video).catch(error => console.warn("[RNHelloDoctor:configure]", {error}));

        RNHelloDoctor.consultations = HDConsultations
        RNHelloDoctor.users = HDUsers
        RNHelloDoctor.videos = HDVideoCalls
    }

    static teardown() {
        connectionService.teardown().catch(error => console.warn("[RNHelloDoctor:teardown]", {error}));
    }
}

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
    static getConsultations(thirdPartyUserID) {
        // TODO probably want to use hd user ID, but things are tangled up with the third-party ID at the moment

        // const currentUser = getCurrentUser()
        //
        // if (currentUser === null) {
        //     console.warn("[HDConsultations:getConsultations] can't get consultations: no current user");
        //     return;
        // }

        return usersServiceApi.getThirdPartyUserConsultations(thirdPartyUserID);
    }
}

class HDVideoCalls {
    static handleIncomingVideoCallNotification(videoCallPayload) {
        return eventHandlers.handleIncomingVideoCall(videoCallPayload)
    }

    static handleIncomingVideoCallNotificationRejected() {
        console.info("[HDVideoCalls:handleIncomingVideoCallNotificationRejected]");

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
            console.debug("[VideoConsultationScreen:startVideoCall] listener status", status);
            switch (status) {
                case "completed":
                case "rejected":
                    this.endVideoCall().catch(console.warn);
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

interface RNHelloDoctorConfig {
    user: HDUser,
    video: HDVideoCallsConfig
}

export interface HDUser {
    uid: string,
    jwt?: string,
    thirdPartyApiKey?: string,
    deviceID?: string
}

interface HDVideoCallsConfig {
    onAnswerCall: function,
    onEndCall: function
}

export {
    connectionManager,
    notifications,
    HDCallKeep,
    HDIncomingVideoCall,
    HDVideoCallRenderer,
    HDVideoPermissionsConfiguration,
    PreviewLocalVideoView,
    withVideoCallPermissions
};
