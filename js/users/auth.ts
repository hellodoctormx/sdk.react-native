import {NativeModules} from "react-native";
import usersAPI from "../api/users";
import {getCurrentUser} from "./currentUser";

const {RNHelloDoctorModule} = NativeModules;

export async function signIn(userID: string, deviceID: string, serverAuthToken: string) {
    const authenticationResponse = await usersAPI.authenticateUser(userID, serverAuthToken)

    const currentUser = getCurrentUser();
    currentUser.jwt = authenticationResponse.bearerToken
    currentUser.uid = userID;
    currentUser.deviceID = deviceID;
    currentUser.isThirdParty = true;
    currentUser.refreshToken = authenticationResponse.refreshToken

    await RNHelloDoctorModule.signIn(userID, serverAuthToken);

    return currentUser
}

export async function signInWithJWT(userID: string, deviceID: string, jwt: string) {
    const currentUser = getCurrentUser();
    currentUser.jwt = jwt
    currentUser.uid = userID;
    currentUser.deviceID = deviceID;
    currentUser.isThirdParty = false;

    await RNHelloDoctorModule.signInWithJWT(userID, jwt);

    return currentUser
}

export function signOut() {
    const currentUser = getCurrentUser();
    currentUser.jwt = null;
    currentUser.uid = null;
    currentUser.deviceID = null;
    currentUser.refreshToken = null;
}

export async function refreshAccessToken() {
    const currentUser = getCurrentUser();

    if (!currentUser?.isThirdParty) {
        return;
    }

    if (currentUser === null || currentUser.refreshToken === null) {
        throw new Error('[refreshAccessToken] cannot refresh access token: no user and/or refresh token available')
    }

    const authenticationResponse = await usersAPI.authenticateUser(currentUser.uid, currentUser.refreshToken)
    currentUser.jwt = authenticationResponse.jwt
    currentUser.refreshToken = authenticationResponse.refreshToken
}
