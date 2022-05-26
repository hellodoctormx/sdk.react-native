import {AppState, NativeModules, Platform, Vibration} from "react-native";
import notifee from "@notifee/react-native";

const {RNHDVideoModule} = NativeModules;

export function displayIncomingCallNotification(videoRoomSID, callerDisplayName) {
    return RNHDVideoModule.displayIncomingCallNotification(videoRoomSID, callerDisplayName);
}

export function connect(videoRoomSID, accessToken) {
    return RNHDVideoModule.connect(videoRoomSID, accessToken);
}

export function isConnectedToRoom(videoRoomSID) {
    return RNHDVideoModule.isConnectedToRoom(videoRoomSID).then(isConnected => {
        console.debug(`got response: (${isConnected})`);
        return isConnected == 1 || isConnected === true;
    }); // TODO figure out casting responses jesus
}

export function getRemoteParticipantIdentities() {
    return RNHDVideoModule.getRemoteParticipantIdentities();
}

export function disconnect() {
    return RNHDVideoModule.disconnect();
}

export function startLocalCapture() {
    return RNHDVideoModule.startLocalCapture();
}

export function stopLocalCapture() {
    return RNHDVideoModule.startLocalCapture();
}

export function setLocalVideoPublished(published) {
    return RNHDVideoModule.setVideoPublished(published);
}

export function setLocalVideoEnabled(enabled) {
    return RNHDVideoModule.setVideoEnabled(enabled);
}

export function setLocalAudioEnabled(enabled) {
    return RNHDVideoModule.setAudioEnabled(enabled);
}

export function setSpeakerEnabled(enabled) {
    return RNHDVideoModule.setSpeakerPhone(enabled);
}

export function flipCamera() {
    return RNHDVideoModule.flipCamera();
}

export async function startNotificationAlerts() {
    if (Platform.OS !== "android") {
        return;
    }

    const doNotificationAlerts = () => new Promise(resolve => {
        RNHDVideoModule.startRingtone();
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
    RNHDVideoModule.stopRingtone()
}
