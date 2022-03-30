import Http from "./http";
import {getCurrentUser} from "../users/auth";
import type {HDUser} from "../../index";

// const videoServiceHost = Config.VideoServiceHost;
// const videoServiceHost = "https://video-service-3o7jotw3dq-uc.a.run.app";
const videoServiceHost = "http://192.168.100.26:3002";

class VideoServiceAPI {
    http = null

    constructor() {
        this.http = new Http(videoServiceHost)
    }

    startConsultationVideoCall(consultationID) {
        return this.http.post(`/start-consultation-call`, {consultationID});
    }

    requestVideoCallAccess(videoRoomSID) {
        console.debug("[requestVideoCallAccess]", {videoRoomSID});
        return this.http.get(`/access-token?videoRoomSID=${videoRoomSID}`);
    }

    getVideoCall(videoRoomSID) {
        console.debug(`[VideoService.getVideoCall] /calls/${videoRoomSID}`);
        return this.http.get(`/calls/${videoRoomSID}`);
    }

    endVideoCall(videoRoomSID) {
        return this.http.post(`/end-call`, {videoRoomSID});
    }

    rejectVideoCall(videoRoomSID) {
        return this.http.post(`/reject-call`, {videoRoomSID});
    }
}

export default new VideoServiceAPI();
