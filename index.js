import * as activeCallManager from "./js/telecom/activeCallManager";
import * as auth from "./js/users/auth";
import * as connectionManager from "./js/telecom/connectionManager";
import * as connectionService from "./js/telecom/connectionService";
import * as eventHandlers from "./js/telecom/eventHandlers";
import HDCallKeep from "./js/callkeep";
import HDVideoCallRenderer from "./js/components/HDVideoCallRenderer"
import HDVideoPermissionsConfiguration from "./js/components/HDVideoPermissionsConfiguration";
import HDIncomingVideoCall from "./js/components/HDIncomingVideoCall"
import PreviewLocalVideoView from "./js/components/PreviewLocalVideoView";
import usersServiceApi from "./js/api/users";
import videoServiceApi from "./js/api/video";
import withVideoCallPermissions from "./js/components/withVideoCallPermissions";

export {
    activeCallManager,
    auth,
    connectionManager,
    connectionService,
    eventHandlers,
    usersServiceApi,
    videoServiceApi,
    HDCallKeep,
    HDIncomingVideoCall,
    HDVideoCallRenderer,
    HDVideoPermissionsConfiguration,
    PreviewLocalVideoView,
    withVideoCallPermissions
};

export default class RNHelloDoctor {
    static _instance: RNHelloDoctor = null

    videos: HDVideoCalls = null

    constructor() {
        // const videoConfig: HDVideoCallsConfig = {
        //     onAnswerCall: config.onAnswerCall,
        //     onEndCall: config.onEndCall
        // }
        //
        // this.videos = new HDVideoCalls(videoConfig)
    }

    static bootstrap(config: RNHelloDoctorConfig) {
        if (RNHelloDoctor._instance === null) {
            RNHelloDoctor._instance = new RNHelloDoctor(config)
        }
    }
}

class HDVideoCalls {
    onAnswerCall: function
    onEndCall: function

    constructor(config: HDVideoCallsConfig) {
        this.onAnswerCall = config.onAnswerCall
        this.onEndCall = config.onEndCall
    }

    handleIncomingVideoCallNotification(videoCallPayload) {
        return eventHandlers.handleIncomingVideoCall(videoCallPayload)
    }

    answerVideoCall() {

    }

    endVideoCall() {

    }
}

interface RNHelloDoctorConfig {
    onAnswerCall: function
    onEndCall: function
}

interface HDVideoCallsConfig {
    onAnswerCall: function
    onEndCall: function
}
