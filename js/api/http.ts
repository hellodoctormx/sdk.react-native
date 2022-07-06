import {getCurrentUser} from "../users/currentUser";
import HDConfig from "../HDConfig";

export default class Http {
    static API_KEY: string = "";

    async get(path: string) {
        return this.doRequest(path, 'GET')
    }

    async post(path: string, data?: Record<string, any>) {
        return this.doRequest(path, 'POST', data)
    }

    async put(path: string, data?: Record<string, any>) {
        return this.doRequest(path, 'PUT', data)
    }

    async delete(path: string) {
        return this.doRequest(path, 'DELETE')
    }

    async doRequest(path: string, method: string, data?: Record<string, any>) {
        const url = `${HDConfig.serviceHost}${path}`;

        const doFetch = () => fetch(url, {
            method,
            body: JSON.stringify(data),
            headers: this.getRequestHeaders()
        })

        let response = await doFetch()

        if (response.status === 401) {
            await this.refreshAccessToken()

            response = await doFetch()
        }

        return nullSafeJsonResponse(response)
    }

    getRequestHeaders() {
        const currentUser = getCurrentUser();

        const requestHeaders = {
            "Content-Type": "application/json",
        }

        if (currentUser !== null) {
            requestHeaders["Authorization"] = `Bearer ${currentUser.jwt}`
            requestHeaders["X-User-UID"] = currentUser.uid
        }

        if (!!Http.API_KEY) {
            requestHeaders["X-Api-Key"] = Http.API_KEY
        }

        return requestHeaders;
    }

    async refreshAccessToken() {
        const currentUser = getCurrentUser();

        if (!currentUser?.refreshToken) {
            return;
        }

        if (currentUser?.uid === null && !currentUser.refreshToken) {
            throw new Error('[refreshAccessToken] cannot refresh access token: no user and/or refresh token available')
        } else if (!currentUser?.refreshToken) {
            return;
        }

        const authenticationResponse = await this.post(`/users/${currentUser.uid}/_authenticate`, {refreshToken: currentUser.refreshToken});
        currentUser.jwt = authenticationResponse.jwt
        currentUser.refreshToken = authenticationResponse.refreshToken
    }

}

export const nullSafeJsonResponse = response => {
    if (response.status < 200 || response.status >= 300) {
        console.warn(`[Http.nullSafeJsonResponse:BAD_STATUS:${response.status}]`, response);
        throw new Error(response.status);
    }

    if (response.headers.get("Content-Type").match("^application/json.*")) {
        return response.json();
    } else {
        return response.data;
    }
};
