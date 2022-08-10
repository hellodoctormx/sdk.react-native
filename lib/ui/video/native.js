import {NativeEventEmitter, NativeModules, requireNativeComponent} from 'react-native';

export const LocalVideoView = requireNativeComponent('HDVideoLocalView');
export const RemoteVideoView = requireNativeComponent('HDVideoRemoteView');
export const hdEventEmitter = new NativeEventEmitter(NativeModules.RNHelloDoctorModule);
