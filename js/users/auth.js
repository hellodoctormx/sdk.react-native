export function signInThirdPartyUser(thirdPartyID, thirdPartyUserID) {

}

export function signIn(userID, jwt) {
    return new HDCurrentUser(userID, jwt);
}

export function signOut() {

}

export function getCurrentUser() {
    return HDCurrentUser.getInstance();
}

class HDCurrentUser {
    id;
    jwt;

    static _instance = null;

    constructor(id, jwt) {
        this.id = id;
        this.jwt = jwt;

        HDCurrentUser._instance = this;
    }

    static getInstance() {
        if (HDCurrentUser._instance === null) {
            console.warn("No current user is configured. Please sign in.");
        }

        return HDCurrentUser._instance;
    }

    getID() {
        return this.id;
    }

    getJWT() {
        return this.jwt;
    }
}
