import Http from "./http";

class UsersServiceAPI extends Http{
    createUser(account: Record<string, any>) {
        return this.post(`/users`, account);
    }

    authenticateUser(userID: string, serverAuthToken: string) {
        return this.post(`/users/${userID}/_authenticate`, {refreshToken: serverAuthToken});
    }

    deleteUser(helloDoctorUserID: string) {
        return this.delete(`/users/${helloDoctorUserID}`);
    }
}

export default new UsersServiceAPI();
