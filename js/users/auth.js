import type {HDUser} from "../../index";

export function signInThirdPartyUser(thirdPartyID, thirdPartyUserID) {

}

let _currentUser: HDUser = null;

export function signIn(user: HDUser) {
    _currentUser = user;

    return _currentUser;
}

export function signOut() {

}

export function getCurrentUser() {
    return _currentUser;
}
