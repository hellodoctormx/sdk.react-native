import {NativeEventEmitter, NativeModules, requireNativeComponent} from "react-native";

export const LocalVideoView = requireNativeComponent("HDVideoLocalView");
export const RemoteVideoView = requireNativeComponent("HDVideoRemoteView");
export const PortalVideoView = requireNativeComponent("HDVideoPortalView");
export const hdVideoEvents = new NativeEventEmitter(NativeModules.HDEventEmitter);
