import Http from "./http";

const videoServiceHost = "https://video-service-pusuheofiq-uc.a.run.app";
// const videoServiceHost = "http://192.168.100.26:3002";

class VideoServiceAPI {
    http = null

    constructor() {
        this.http = new Http(videoServiceHost)
    }

    requestVideoCallAccess(videoRoomSID) {
        return this.http.get(`/access-token?videoRoomSID=${videoRoomSID}`);
    }

    getVideoCall(videoRoomSID) {
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
