import Http from "./http";

class UsersServiceAPI extends Http{
    createUser(account) {
        return this.post(`/users`, account);
    }

    authenticateUser(userID, serverAuthToken) {
        return this.post(`/users/${userID}/_authenticate`, {refreshToken: serverAuthToken});
    }

    deleteUser(helloDoctorUserID) {
        return this.delete(`/users/${helloDoctorUserID}`);
    }
}

export default new UsersServiceAPI();
