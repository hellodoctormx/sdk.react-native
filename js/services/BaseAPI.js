import auth from "@react-native-firebase/auth";

export default class BaseAPI {
    constructor(host) {
        this.host = host;
    }

    async getRequestHeaders(headers) {
        const userToken = await auth().currentUser.getIdToken();

        headers = headers || {};

        return {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": userToken,
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
