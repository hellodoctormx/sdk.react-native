export interface HDConfigOptions {
    serviceHost: string,
    onAnswerCall: Function,
    onEndCall: Function,
    onIncomingCall?: Function,
    ios: {
        onRegisterPushKitToken: Function
    }
}

const config: HDConfigOptions = {
    serviceHost: null,
    onAnswerCall: null,
    onEndCall: null,
    onIncomingCall: null,
    ios: null
}

export default config;
