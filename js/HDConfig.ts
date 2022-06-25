export interface HDConfigOptions {
    appName: string
    apiKey?: string
    serviceHost: string
    onAnswerCall: Function
    onEndCall: Function
    onIncomingCall?: Function
    ios: {
        onRegisterPushKitToken: Function
    }
}

const config: HDConfigOptions = {
    appName: "",
    serviceHost: null,
    onAnswerCall: null,
    onEndCall: null,
    onIncomingCall: null,
    ios: null
}

export default config;
