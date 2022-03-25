import Http from "./http";

// const usersServiceHost = Config.UserServiceHost;
const usersServiceHost = "https://user-service-3o7jotw3dq-uc.a.run.app";
// const usersServiceHost = "http://192.168.100.26:3009";

class UsersServiceAPI {
    http = null;

    constructor() {
        this.http = new Http(usersServiceHost);
    }

    registerThirdPartyUserAccount(account) {
        return this.http.post(`/third-party/users`, account, this.getThirdPartyApiKeyHeaders());
    }

    deleteThirdPartyUserAccount(helloDoctorUserID) {
        return this.http.delete(`/third-party/users/${helloDoctorUserID}`, this.getThirdPartyApiKeyHeaders());
    }

    updateThirdPartyUserMessagingToken(userID, deviceID, fcmToken) {
        return this.http.put(`/third-party/users/${userID}/devices/${deviceID}`, {fcmToken}, this.getThirdPartyApiKeyHeaders());
    }

    getThirdPartyUserConsultations(helloDoctorUserID) {
        return this.http.get(`/third-party/users/${helloDoctorUserID}/consultations`, this.getThirdPartyApiKeyHeaders());
    }

    rejectThirdPartyUserCall(videoRoomSID) {
        return this.http.post(`/third-party/calls/${videoRoomSID}/_reject`, null, this.getThirdPartyApiKeyHeaders());
    }

    getThirdPartyApiKeyHeaders() {
        // TODO get from config or something
        const deliLifeApiKey = "Ax3JVY2pal5f8i6NwLNX3wjssyiR46u7itHypjZe";

        return {
            "X-Third-Party-Api-Key": deliLifeApiKey
        }
    }
}

export default new UsersServiceAPI();
