import {NativeModules} from "react-native";

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
    console.debug("[HDVideoModule:disconnect]");
    return HDVideoModule.disconnect();
}

export function startLocalCapture() {
    return HDVideoModule.startLocalCapture();
}

export function setLocalVideoPublished(published) {
    console.debug(`setLocalVideoPublished: ${published}`);
    return HDVideoModule.setVideoPublished(published);
}

export function setLocalVideoEnabled(enabled) {
    console.debug(`setLocalVideoEnabled: ${enabled}`);
    return HDVideoModule.setVideoEnabled(enabled);
}

export function setLocalAudioEnabled(enabled) {
    console.debug(`setLocalAudioEnabled: ${enabled}`);
    return HDVideoModule.setAudioEnabled(enabled);
}

export function setSpeakerEnabled(enabled) {
    console.debug(`setSpeakerEnabled: ${enabled}`);
    return HDVideoModule.setSpeakerPhone(enabled);
}

export function flipCamera() {
    return HDVideoModule.flipCamera();
}

export function wakeMainActivity() {
    console.debug("[HDVideo:wakeMainActivity]");
    return HDVideoModule.wakeMainActivity();
}
