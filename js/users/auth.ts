import type {HDUser} from "../../index";
import usersServiceApi from "../api/users";

let _currentUser: HDUser = null
let _refreshToken: string = null

export async function signIn(userID: string, deviceID: string, jwt?: string, serverAuthToken?: string) {
    _currentUser = {
        uid: userID,
        deviceID: deviceID
    }

    if (jwt) {
        _currentUser.jwt = jwt
    } else if (serverAuthToken) {
        const authenticationResponse = await usersServiceApi.authenticateThirdPartyUser(userID, serverAuthToken)
        _currentUser.jwt = authenticationResponse.jwt
        _refreshToken = authenticationResponse.refreshToken
    } else {
        throw new Error('either jwt or serverAuthToken must be provided')
    }

    return _currentUser
}

export function signOut() {
    _currentUser = null
    _refreshToken = null
}

export async function refreshAccessToken() {
    console.debug("[refreshAccessToken]", {_refreshToken});
    if (_currentUser === null || _refreshToken === null) {
        throw new Error('[refreshAccessToken] cannot refresh access token: no user and/or refresh token available')
    }

    const authenticationResponse = await usersServiceApi.authenticateThirdPartyUser(_currentUser.uid, _refreshToken)
    _currentUser.jwt = authenticationResponse.jwt
    _refreshToken = authenticationResponse.refreshToken
}

export function getCurrentUser() {
    return _currentUser || null
}
