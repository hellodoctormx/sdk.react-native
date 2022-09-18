import {HelloDoctorHTTPClient} from '../api/http';

const httpClient = new HelloDoctorHTTPClient();

export function ping(): Promise<void> {
    return httpClient.post('/ping');
}
