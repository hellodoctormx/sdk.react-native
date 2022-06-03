import Http from "./http";

class VideoServiceAPI extends Http {
    requestVideoCallAccess(videoRoomSID: string) {
        return this.get(`/vide/${videoRoomSID}/access-token`);
    }

    endVideoCall(videoRoomSID: string) {
        return this.post(`/vide/${videoRoomSID}/_end`);
    }
}

export default new VideoServiceAPI();
