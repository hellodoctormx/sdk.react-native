import Http from "./http";

class UsersServiceAPI {
    http = null;

    constructor() {
        this.http = new Http();
    }

    createUser(account) {
        return this.http.post(`/users`, account);
    }

    authenticateUser(userID, serverAuthToken) {
        return this.http.post(`/users/${userID}/_authenticate`, {refreshToken: serverAuthToken});
    }

    deleteUser(helloDoctorUserID) {
        return this.http.delete(`/users/${helloDoctorUserID}`);
    }

    // deprecated
    updateThirdPartyUserMessagingToken(userID, deviceID, fcmToken) {
        return this.http.put(`/devices/${deviceID}`, {fcmToken});
    }

    // deprecated
    rejectThirdPartyUserCall(videoRoomSID) {
        return this.http.post(`/calls/${videoRoomSID}/_reject`, null);
    }

    async registerApnsToken(deviceID, apnsToken) {
        if (!deviceID) {
            console.warn("[registerApnsToken can't register token: no device ID available");
            return;
        }

        return this.http.put(`/devices/${deviceID}`, {apnsToken});
    }

    async unregisterApnsToken(deviceID) {
        if (!deviceID) {
            console.warn("[registerApnsToken can't register token: no device ID available");
            return;
        }

        return this.http.put(`/devices/${deviceID}`, {apnsToken: null});
    }
}

export default new UsersServiceAPI();
