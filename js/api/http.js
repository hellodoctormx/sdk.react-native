import {getCurrentUser, refreshAccessToken} from "../users/auth";

export default class Http {
    static API_KEY: string = "";

    constructor(host) {
        this.host = host;
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
            await refreshAccessToken()

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
