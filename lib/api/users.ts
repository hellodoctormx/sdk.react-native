import {HelloDoctorHTTPClient} from './http';

class UsersServiceAPI {
    httpClient = new HelloDoctorHTTPClient();

    authenticateUser(userID: string, serverAuthToken: string) {
        return this.httpClient.post(`/users/${userID}/_authenticate`, {refreshToken: serverAuthToken});
    }
}

export default new UsersServiceAPI();
