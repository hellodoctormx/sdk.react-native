import Http from "./http";

class VideoServiceAPI extends Http {
    requestVideoCallAccess(videoRoomSID: string) {
        return this.get(`/video/${videoRoomSID}/access-token`);
    }

    endVideoCall(videoRoomSID: string) {
        return this.post(`/video/${videoRoomSID}/_end`);
    }
}

export default new VideoServiceAPI();
