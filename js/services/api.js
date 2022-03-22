import Config from "react-native-config";
import BaseAPI from "../../../services/BaseAPI";

const videoServiceHost = Config.VideoServiceHost;
// const videoServiceHost = "https://video-service-3o7jotw3dq-uc.a.run.app";
// const videoServiceHost = "http://192.168.100.26:3002";

export default class VideoService {
    static baseAPI = new BaseAPI(videoServiceHost)

    static startConsultationVideoCall(consultationID) {
        return VideoService.baseAPI.post(`/start-consultation-call`, {consultationID});
    }

    static requestConsultationVideoCallAccess(consultationID, videoRoomSID) {
        console.debug("[requestConsultationVideoCallAccess]", {consultationID, videoRoomSID});
        return VideoService.baseAPI.get(`/access-token?consultationID=${consultationID}&videoRoomSID=${videoRoomSID}`);
    }

    static getVideoCall(videoRoomSID) {
        console.debug(`[VideoService.getVideoCall] /calls/${videoRoomSID}`);
        return VideoService.baseAPI.get(`/calls/${videoRoomSID}`);
    }

    static endVideoCall(videoRoomSID) {
        return VideoService.baseAPI.post(`/end-call`, {videoRoomSID});
    }

    static rejectVideoCall(videoRoomSID) {
        return VideoService.baseAPI.post(`/reject-call`, {videoRoomSID});
    }
}
