import {NativeModules, Platform} from 'react-native';
import {HelloDoctorHTTPClient} from './api/http';
import usersAPI from './api/users';
import videoAPI from './api/video';
import * as connectionManager from './telecom/connectionManager';
import * as connectionService from './telecom/connectionService';
import * as eventHandlers from './telecom/eventHandlers';
import * as auth from './users/auth';
import * as schedulingService from './services/scheduling.service';
import * as currentUser from './users/currentUser';
import HDConfig from './config';
import {ConfigOptions, VideoCallNotification} from './types';

const {RNHelloDoctorModule} = NativeModules;

export let appName: string;

export namespace RNHelloDoctor {
    export async function configure(config: ConfigOptions) {
        appName = config.appName;

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

        return;
    }

    export async function signIn(userID: string, serverAuthToken: string) {
        await auth.signIn(userID, serverAuthToken);

        if (Platform.OS === 'ios') {
            connectionService.bootstrap();
        }
    }

    export async function signInWithJWT(userID: string, jwt: string) {
        await auth.signInWithJWT(userID, jwt);

        if (Platform.OS === 'ios') {
            connectionService.bootstrap();
        }
    }

    export function teardown() {
        connectionService.teardown();
    }

    export namespace users {
        export function getCurrentUser() {
            return currentUser.getCurrentUser();
        }

        export function authenticate(userID: string, serverAuthToken: string) {
            return usersAPI.authenticateUser(userID, serverAuthToken);
        }
    }

    export namespace consultations {
        export function getAvailability(requestMode: string, specialty: string, start: Date, end: Date) {
            return schedulingService.getAvailability(requestMode, specialty, start, end);
        }

        export function requestConsultation(requestMode: string, specialty: string, requestedTime: Date, reason: string) {
            return schedulingService.requestConsultation(requestMode, specialty, requestedTime, reason);
        }

        export function getConsultations(limit: number) {
            return schedulingService.getUserConsultations(limit);
        }
    }

    export namespace video {
        export function handleIncomingVideoCallNotification(videoCallPayload: VideoCallNotification) {
            const {videoRoomSID, consultationID, callerDisplayName, callerPhotoURL} = videoCallPayload;

            return eventHandlers.handleIncomingVideoCallNotification(videoRoomSID, consultationID, callerDisplayName, callerPhotoURL);
        }

        export function handleIncomingVideoCallNotificationRejected() {
            const incomingCall = connectionManager.getIncomingCall();

            if (!incomingCall) {
                return;
            }

            connectionManager.rejectVideoCall(incomingCall.videoRoomSID).catch(console.warn);
        }

        export function registerVideoCall(videoRoomSID: string, consultationID: string, callerDisplayName: string): Promise<any> {
            return connectionManager.registerVideoCall(undefined, videoRoomSID, consultationID, {displayName: callerDisplayName});
        }

        export function handleVideoCallEndedNotification(videoRoomSID: string) {
            return eventHandlers.handleVideoCallEndedNotification(videoRoomSID);
        }

        export function startVideoCall(videoRoomSID: string) {
            connectionManager.handleIncomingVideoCallStarted(videoRoomSID);
        }

        export function endVideoCall(videoRoomSID: string) {
            return connectionManager.endVideoCall(videoRoomSID);
        }

        export function getVideoCallAccessToken(videoRoomSID: string) {
            return videoAPI
                .requestVideoCallAccess(videoRoomSID)
                .then((response: {accessToken: string}) => response.accessToken);
        }
    }
}
