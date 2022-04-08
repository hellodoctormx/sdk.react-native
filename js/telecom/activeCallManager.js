import {AppState, NativeModules, Platform, Vibration} from "react-native";
import notifee from "@notifee/react-native";

const {HDVideoModule} = NativeModules;

export function connect(videoRoomSID, accessToken) {
    return HDVideoModule.connect(videoRoomSID, accessToken);
}

export function isConnectedToRoom(videoRoomSID) {
    return HDVideoModule.isConnectedToRoom(videoRoomSID).then(isConnected => {
        console.debug(`got response: (${isConnected})`);
        return isConnected == 1 || isConnected === true;
    }); // TODO figure out casting responses jesus
}

export function getRemoteParticipantIdentities() {
    return HDVideoModule.getRemoteParticipantIdentities();
}

export function disconnect() {
    return HDVideoModule.disconnect();
}

export function startLocalCapture() {
    return HDVideoModule.startLocalCapture();
}

export function setLocalVideoPublished(published) {
    return HDVideoModule.setVideoPublished(published);
}

export function setLocalVideoEnabled(enabled) {
    return HDVideoModule.setVideoEnabled(enabled);
}

export function setLocalAudioEnabled(enabled) {
    return HDVideoModule.setAudioEnabled(enabled);
}

export function setSpeakerEnabled(enabled) {
    return HDVideoModule.setSpeakerPhone(enabled);
}

export function flipCamera() {
    return HDVideoModule.flipCamera();
}

export async function startNotificationAlerts() {
    if (Platform.OS !== "android") {
        return;
    }

    const doNotificationAlerts = async () => {
        Vibration.vibrate([800, 1600], true);
        HDVideoModule.startRingtone()
    }

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
    HDVideoModule.stopRingtone()
}
