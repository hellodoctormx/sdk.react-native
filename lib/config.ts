import {ConfigOptions} from './types';

const config: ConfigOptions = {
    mode: 'integration',
    appID: '',
    appName: '',
    apiKey: undefined,
    serviceHost: '',
    onAnswerCall: () => {
        throw 'not_implemented';
    },
    onEndCall: () => {
        throw 'not_implemented';
    },
    onIncomingCall: () => {
        throw 'not_implemented';
    },
    ios: {
        onRegisterPushKitToken: () => {
            throw 'not_implemented';
        },
    },
};

export default config;
