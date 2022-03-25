import Http from "./http";

// const videoServiceHost = Config.VideoServiceHost;
const videoServiceHost = "https://video-service-3o7jotw3dq-uc.a.run.app";
// const videoServiceHost = "http://192.168.100.26:3002";

export default class VideoServiceAPI {
    static http = new Http(videoServiceHost)

    static startConsultationVideoCall(consultationID) {
        return VideoServiceAPI.http.post(`/start-consultation-call`, {consultationID});
    }

    static requestConsultationVideoCallAccess(consultationID, videoRoomSID) {
        console.debug("[requestConsultationVideoCallAccess]", {consultationID, videoRoomSID});
        return VideoServiceAPI.http.get(`/access-token?consultationID=${consultationID}&videoRoomSID=${videoRoomSID}`);
    }

    static getVideoCall(videoRoomSID) {
        console.debug(`[VideoService.getVideoCall] /calls/${videoRoomSID}`);
        return VideoServiceAPI.http.get(`/calls/${videoRoomSID}`);
    }

    static endVideoCall(videoRoomSID) {
        return VideoServiceAPI.http.post(`/end-call`, {videoRoomSID});
    }

    static rejectVideoCall(videoRoomSID) {
        return VideoServiceAPI.http.post(`/reject-call`, {videoRoomSID});
    }

    static async registerApnsToken(token) {

    }

    static async unregisterApnsToken() {

    }
}
