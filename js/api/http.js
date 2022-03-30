import {getCurrentUser} from "../users/auth";

export default class Http {
    constructor(host, headers) {
        this.host = host;
        this.headers = headers;
    }

    getRequestHeaders(headers) {
        const currentUser = getCurrentUser();

        if (currentUser === null) {
            console.warn("[VideoServiceAPI:getRequestHeaders] attempting to request headers without current user");
            return headers;
        }

        return {
            "Authorization": `Bearer ${currentUser.jwt}`,
            "X-User-UID": currentUser.uid,
            "X-Third-Party-Api-Key": currentUser.thirdPartyApiKey,
            ...headers
        }
    }

    async post(path, data, headers) {
        const requestHeaders = await this.getRequestHeaders(headers);

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
            headers: await this.getRequestHeaders(headers),
            body: JSON.stringify(data)
        });

        return request.then(nullSafeJsonResponse);
    }

    async get(path, headers) {
        console.debug(`getting ${this.host}/${path}`);
        return fetch(`${this.host}${path}`, {
            method: "GET",
            headers: await this.getRequestHeaders(headers)
        }).then(nullSafeJsonResponse);
    }

    async delete(path, headers) {
        return fetch(`${this.host}${path}`, {
            method: "DELETE",
            headers: await this.getRequestHeaders(headers)
        });
    }
}

export const nullSafeJsonResponse = response => {
    if (response.status < 200 || response.status >= 300) {
        console.debug("returning error", response);
        throw new Error(response.status);
    }

    if (response.headers.get("Content-Type").match("^application/json.*")) {
        return response.json();
    } else {
        return response.data;
    }
};
