export function signInThirdPartyUser(thirdPartyID, thirdPartyUserID) {

}

export function signIn(userID, jwt) {
    return new HDCurrentUser(userID, jwt);
}

export function getCurrentUser() {
    return HDCurrentUser.getInstance();
}

class HDCurrentUser {
    _id;
    _jwt;

    static _instance;

    constructor(id, jwt) {
        this._id = id;
        this._jwt = jwt;

        HDCurrentUser._instance = this;
    }

    static getInstance() {
        if (HDCurrentUser._instance === null) {
            throw new Error("No current user is configured. Please sign in.");
        }

        return HDCurrentUser._instance;
    }

    getID() {
        return this._id;
    }

    getJWT() {
        return this._jwt;
    }
}
