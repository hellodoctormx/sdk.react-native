import {HelloDoctorHTTPClient} from "./http";

const httpClient = new HelloDoctorHTTPClient()

class VideoServiceAPI {
    requestVideoCallAccess(videoRoomSID: string) {
        return httpClient.get(`/video/${videoRoomSID}/access-token`);
    }

    endVideoCall(videoRoomSID: string) {
        return httpClient.post(`/video/${videoRoomSID}/_end`);
    }
}

export default new VideoServiceAPI();
