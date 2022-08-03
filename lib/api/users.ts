import {HelloDoctorHTTPClient} from "./http";

class UsersServiceAPI {
    httpClient = new HelloDoctorHTTPClient()

    createUser(account: Record<string, any>) {
        return this.httpClient.post(`/users`, account);
    }

    authenticateUser(userID: string, serverAuthToken: string) {
        return this.httpClient.post(`/users/${userID}/_authenticate`, {refreshToken: serverAuthToken});
    }

    deleteUser(helloDoctorUserID: string) {
        return this.httpClient.delete(`/users/${helloDoctorUserID}`);
    }
}

export default new UsersServiceAPI();
