import Http from "./http";
import {getCurrentUser} from "../users/auth";

// const usersServiceHost = Config.UserServiceHost;
const usersServiceHost = "https://user-service-pusuheofiq-uc.a.run.app";
// const usersServiceHost = "http://192.168.100.26:3009";

class UsersServiceAPI {
    http = null;

    constructor() {
        this.http = new Http(usersServiceHost);
    }

    createThirdPartyUserAccount(account) {
        return this.http.post(`/third-party/users`, account);
    }

    deleteThirdPartyUserAccount(helloDoctorUserID) {
        return this.http.delete(`/third-party/users/${helloDoctorUserID}`);
    }

    updateThirdPartyUserMessagingToken(userID, deviceID, fcmToken) {
        return this.http.put(`/third-party/users/${userID}/devices/${deviceID}`, {fcmToken});
    }

    getThirdPartyUserConsultations(helloDoctorUserID) {
        return this.http.get(`/third-party/users/${helloDoctorUserID}/consultations`);
    }

    rejectThirdPartyUserCall(videoRoomSID) {
        return this.http.post(`/third-party/calls/${videoRoomSID}/_reject`, null);
    }

    async registerApnsToken(apnsToken) {
        const currentUser = getCurrentUser();

        if (currentUser === null) {
            console.warn("[registerApnsToken can't register token: no current user");
            return;
        } else if (!currentUser.deviceID) {
            console.warn("[registerApnsToken can't register token: no device ID available");
            return;
        }

        return this.http.put(`/devices/${currentUser.deviceID}`, {apnsToken});
    }

    async unregisterApnsToken() {
        const currentUser = getCurrentUser();

        if (currentUser === null) {
            console.warn("[registerApnsToken can't register token: no current user");
            return;
        } else if (!currentUser.deviceID) {
            console.warn("[registerApnsToken can't register token: no device ID available");
            return;
        }

        return this.http.put(`/devices/${currentUser.deviceID}`, {apnsToken: null});
    }
}

export default new UsersServiceAPI();
