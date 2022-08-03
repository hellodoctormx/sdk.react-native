export interface HDConfigOptions {
    appName: string
    apiKey?: string
    serviceHost: string
    onAnswerCall: (consultationID: string, videoRoomSID: string, accessToken: string) => void
    onEndCall: (consultationID: string, videoRoomSID: string) => void
    onIncomingCall?: () => void
    ios: {
        onRegisterPushKitToken: (token: string) => void
    }
}

const config: HDConfigOptions = {
    appName: "",
    apiKey: undefined,
    serviceHost: "",
    onAnswerCall: () => {
        throw "not_implemented"
    },
    onEndCall: () => {
        throw "not_implemented"
    },
    onIncomingCall: () => {
        throw "not_implemented"
    },
    ios: {
        onRegisterPushKitToken: () => {
            throw "not_implemented"
        }
    }
}

export default config;
