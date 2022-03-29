import Http from "./http";
import {getCurrentUser} from "../users/auth";

// const videoServiceHost = Config.VideoServiceHost;
// const videoServiceHost = "https://video-service-3o7jotw3dq-uc.a.run.app";
const videoServiceHost = "http://192.168.100.26:3002";

class VideoServiceAPI {
    http

    constructor() {
        this.http = new Http(videoServiceHost)
    }

    startConsultationVideoCall(consultationID) {
        return this.http.post(`/start-consultation-call`, {consultationID}, this.getThirdPartyApiKeyHeaders());
    }

    requestVideoCallAccess(consultationID, videoRoomSID) {
        console.debug("[requestVideoCallAccess]", {consultationID, videoRoomSID});
        return this.http.get(`/access-token?consultationID=${consultationID}&videoRoomSID=${videoRoomSID}`, this.getThirdPartyApiKeyHeaders());
    }

    getVideoCall(videoRoomSID) {
        console.debug(`[VideoService.getVideoCall] /calls/${videoRoomSID}`);
        return this.http.get(`/calls/${videoRoomSID}`, this.getThirdPartyApiKeyHeaders());
    }

    endVideoCall(videoRoomSID) {
        return this.http.post(`/end-call`, {videoRoomSID}, this.getThirdPartyApiKeyHeaders());
    }

    rejectVideoCall(videoRoomSID) {
        return this.http.post(`/reject-call`, {videoRoomSID}, this.getThirdPartyApiKeyHeaders());
    }

    async registerApnsToken(token) {

    }

    async unregisterApnsToken() {

    }

    getThirdPartyApiKeyHeaders() {
        // TODO get from config or something
        const deliLifeApiKey = "1C362B8B9E6868D76E385C6CBC7D4";

        return {
            "X-Third-Party-Api-Key": deliLifeApiKey,
            "X-User-UID": getCurrentUser().id
        }
    }
}

export default new VideoServiceAPI();
