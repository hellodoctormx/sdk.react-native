import {NativeEventEmitter, NativeModules, requireNativeComponent} from "react-native";

const LocalVideoView = requireNativeComponent("HDVideoLocalView");
const RemoteVideoView = requireNativeComponent("HDVideoRemoteView");
const PortalVideoView = requireNativeComponent("HDVideoPortalView");

const {HDVideo: HDVideoModule} = NativeModules;
const hdVideoEvents = new NativeEventEmitter(NativeModules.RNEventEmitter);

class HDVideo {
    static connect(videoRoomSID, accessToken) {
        return HDVideoModule.connect(videoRoomSID, accessToken);
    }

    static isConnectedToRoom(videoRoomSID) {
        return HDVideoModule.isConnectedToRoom(videoRoomSID).then(isConnected => {
            console.debug(`got response: (${isConnected})`);
            return isConnected == 1 || isConnected === true;
        }); // TODO figure out casting responses jesus
    }

    static getRemoteParticipants() {
        return HDVideoModule.getRemoteParticipants();
    }

    static disconnect() {
        console.debug("[HDVideoModule:disconnect]");
        return HDVideoModule.disconnect();
    }

    static startLocalCapture() {
        return HDVideoModule.startLocalCapture();
    }

    static setLocalVideoPublished(published) {
        console.debug(`setLocalVideoPublished: ${published}`);
        return HDVideoModule.setVideoPublished(published);
    }

    static setLocalVideoEnabled(enabled) {
        console.debug(`setLocalVideoEnabled: ${enabled}`);
        return HDVideoModule.setVideoEnabled(enabled);
    }

    static setLocalAudioEnabled(enabled) {
        console.debug(`setLocalAudioEnabled: ${enabled}`);
        return HDVideoModule.setAudioEnabled(enabled);
    }

    static setSpeakerEnabled(enabled) {
        console.debug(`setSpeakerEnabled: ${enabled}`);
        return HDVideoModule.setSpeakerPhone(enabled);
    }

    static flipCamera() {
        return HDVideoModule.flipCamera();
    }

    static wakeMainActivity() {
        console.debug("[HDVideo:wakeMainActivity]");
        return HDVideoModule.wakeMainActivity();
    }
}

export {HDVideo, hdVideoEvents, LocalVideoView, RemoteVideoView, PortalVideoView};

