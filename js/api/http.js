import {getCurrentUser} from "../users/currentUser";

export const publicApiHost = "https://public-api-pusuheofiq-uc.a.run.app";
// export const publicApiHost = "http://192.168.100.26:3010";

export default class Http {
    static API_KEY: string = "";

    constructor(host) {
        this.host = host || publicApiHost;
    }

    async post(path, data) {
        return this.doRequest(`${this.host}${path}`, 'POST', data)
    }

    async put(path, data) {
        return this.doRequest(`${this.host}${path}`, 'PUT', data)
    }

    async get(path) {
        return this.doRequest(`${this.host}${path}`, 'GET')
    }

    async delete(path) {
        return this.doRequest(`${this.host}${path}`, 'DELETE')
    }

    async doRequest(path, method, data) {
        const doFetch = () => fetch(path, {
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

        if (!currentUser?.isThirdParty) {
            return;
        }

        if (currentUser === null || currentUser.refreshToken === null) {
            throw new Error('[refreshAccessToken] cannot refresh access token: no user and/or refresh token available')
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
