import {getCurrentUser} from "../users/auth";

export default class Http {
    static API_KEY: string = "";

    constructor(host) {
        this.host = host;
    }

    getRequestHeaders(headers) {
        const currentUser = getCurrentUser();

        const requestHeaders = {
            "Content-Type": "application/json",
            ...headers
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

    async post(path, data, headers) {
        const requestHeaders = this.getRequestHeaders(headers);

        const request = fetch(`${this.host}${path}`, {
            method: "POST",
            headers: requestHeaders,
            body: JSON.stringify(data)
        });

        return request.then(nullSafeJsonResponse);
    }

    async put(path, data, headers) {
        const request = fetch(`${this.host}${path}`, {
            method: "PUT",
            headers: this.getRequestHeaders(headers),
            body: JSON.stringify(data)
        });

        return request.then(nullSafeJsonResponse);
    }

    async get(path, headers) {
        return fetch(`${this.host}${path}`, {
            method: "GET",
            headers: this.getRequestHeaders(headers)
        }).then(nullSafeJsonResponse);
    }

    async delete(path, headers) {
        return fetch(`${this.host}${path}`, {
            method: "DELETE",
            headers: this.getRequestHeaders(headers)
        });
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
