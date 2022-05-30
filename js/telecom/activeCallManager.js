import {AppState, NativeModules, Platform, Vibration} from "react-native";
import notifee from "@notifee/react-native";

const {RNHelloDoctorModule} = NativeModules;

export function displayIncomingCallNotification(videoRoomSID, callerDisplayName, callerPhotoURL) {
    return RNHelloDoctorModule.displayIncomingCallNotification(videoRoomSID, callerDisplayName, callerPhotoURL);
}

export function connect(videoRoomSID, accessToken) {
    return RNHelloDoctorModule.connect(videoRoomSID, accessToken);
}

export function isConnectedToRoom(videoRoomSID) {
    return RNHelloDoctorModule.isConnectedToRoom(videoRoomSID).then(isConnected => {
        console.debug(`got response: (${isConnected})`);
        return isConnected == 1 || isConnected === true;
    }); // TODO figure out casting responses jesus
}

export function getRemoteParticipantIdentities() {
    return RNHelloDoctorModule.getRemoteParticipantIdentities();
}

export function disconnect() {
    return RNHelloDoctorModule.disconnect();
}

export function startLocalCapture() {
    return RNHelloDoctorModule.startLocalCapture();
}

export function stopLocalCapture() {
    return RNHelloDoctorModule.startLocalCapture();
}

export function setLocalVideoPublished(published) {
    return RNHelloDoctorModule.setVideoPublished(published);
}

export function setLocalVideoEnabled(enabled) {
    return RNHelloDoctorModule.setVideoEnabled(enabled);
}

export function setLocalAudioEnabled(enabled) {
    return RNHelloDoctorModule.setAudioEnabled(enabled);
}

export function setSpeakerEnabled(enabled) {
    return RNHelloDoctorModule.setSpeakerPhone(enabled);
}

export function flipCamera() {
    return RNHelloDoctorModule.flipCamera();
}

export async function startNotificationAlerts() {
    if (Platform.OS !== "android") {
        return;
    }

    const doNotificationAlerts = () => new Promise(resolve => {
        RNHelloDoctorModule.startRingtone();
        Vibration.vibrate([800, 1600], true);
    });

    if (AppState.currentState === "active") {
        await doNotificationAlerts();
    } else {
        notifee.registerForegroundService(doNotificationAlerts);
    }
}

export function stopNotificationAlerts() {
    if (Platform.OS !== "android") {
        return;
    }

    notifee.stopForegroundService()

    Vibration.cancel();
    RNHelloDoctorModule.stopRingtone()
}
