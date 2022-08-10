import {NativeModules, Platform} from 'react-native';
import {HelloDoctorHTTPClient} from './api/http';
import usersAPI from './api/users';
import videoAPI from './api/video';
import * as connectionManager from './telecom/connectionManager';
import * as connectionService from './telecom/connectionService';
import * as eventHandlers from './telecom/eventHandlers';
import * as auth from './users/auth';
import * as schedulingService from './services/scheduling.service';
import {getCurrentUser} from './users/currentUser';
import HDConfig, {HDConfigOptions} from './HDConfig';

const {RNHelloDoctorModule} = NativeModules;

export default class RNHelloDoctor {
    static appName: string;

    static async configure(config: HDConfigOptions) {
        RNHelloDoctor.appName = config.appName;

        Object.assign(HDConfig, config);

        HelloDoctorHTTPClient.API_KEY = config.apiKey!;

        switch (Platform.OS) {
        case 'android':
            await RNHelloDoctorModule.configure(config.apiKey, config.serviceHost);
            break;
        case 'ios':
            await RNHelloDoctorModule.getAPNSToken().then(HDConfig.ios.onRegisterPushKitToken);
            break;
        }

        console.debug('[RNHelloDoctor.configure:DONE]');
        return;
    }

    static async signIn(userID: string, serverAuthToken: string) {
        await auth.signIn(userID, serverAuthToken);

        if (Platform.OS === 'ios') {
            connectionService.bootstrap();
        }
    }

    static async signInWithJWT(userID: string, jwt: string) {
        await auth.signInWithJWT(userID, jwt);

        if (Platform.OS === 'ios') {
            connectionService.bootstrap();
        }
    }

    static teardown() {
        connectionService.teardown();
    }

    // USER FUNCTIONS
    static getCurrentUser() {
        return getCurrentUser();
    }

    static createUser(accountPayload: Record<string, any>) {
        return usersAPI.createUser(accountPayload);
    }

    static deleteUser(userID: string) {
        return usersAPI.deleteUser(userID);
    }

    // SCHEDULING & CONSULTATION FUNCTIONS
    static getAvailability(requestMode: string, specialty: string, start: Date, end: Date) {
        return schedulingService.getAvailability(requestMode, specialty, start, end);
    }

    static requestConsultation(requestMode: string, specialty: string, requestedTime: Date, reason: string) {
        return schedulingService.requestConsultation(requestMode, specialty, requestedTime, reason);
    }

    static getConsultations(limit: number) {
        return schedulingService.getUserConsultations(limit);
    }

    // VIDEO CALL FUNCTIONS
    static handleIncomingVideoCallNotification(videoCallPayload: eventHandlers.PushKitCallNotification) {
        const {videoRoomSID, callerDisplayName, callerPhotoURL} = videoCallPayload;

        return eventHandlers.handleIncomingVideoCallNotification(videoRoomSID, callerDisplayName, callerPhotoURL);
    }

    static handleIncomingVideoCallNotificationRejected() {
        const incomingCall = connectionManager.getIncomingCall();

        if (!incomingCall) {
            return;
        }

        connectionManager.rejectVideoCall(incomingCall.videoRoomSID).catch(console.warn);
    }

    // deprecated: use handleVideoCallEndedNotification
    static handleIncomingVideoCallEndedRemotely(videoRoomSID: string) {
        return eventHandlers.handleIncomingVideoCallEndedRemotely(videoRoomSID);
    }

    static handleVideoCallEndedNotification(videoRoomSID: string) {
        return eventHandlers.handleVideoCallEndedNotification(videoRoomSID);
    }

    static startVideoCall(videoRoomSID: string) {
        connectionManager.handleIncomingVideoCallStarted(videoRoomSID);
    }

    static endVideoCall(videoRoomSID: string) {
        return connectionManager.endVideoCall(videoRoomSID);
    }

    static getVideoCallAccessToken(videoRoomSID: string) {
        return videoAPI
            .requestVideoCallAccess(videoRoomSID)
            .then((response: {accessToken: string}) => response.accessToken);
    }
}
