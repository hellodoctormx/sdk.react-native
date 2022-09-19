// @ts-ignore
import uuid from 'react-native-uuid-generator';
import RNCallKeep from './callkeep';
import VideoService from '../api/video';
import {navigateOnEndCall} from './eventHandlers';
import {AppRegistry, NativeModules, Platform} from 'react-native';
import {VideoCall, VideoCallParticipant} from '../types';
import {pingIntegrationStep} from "../utils/integration.utils";

const {RNHelloDoctorModule} = NativeModules;

const calls: Array<VideoCall> = [];

const getNewCallUUID = async () => {
    const callUUID = await uuid.getRandomUUID();
    // have to toLowerCase because CallKeep internally lower cases that shit for whatever reason
    return callUUID.toLowerCase();
};

export function getCallByUUID(callUUID: string) {
    return calls.find(c => c.uuid === callUUID);
}

export function getActiveCall() {
    return calls.find(c => c.status === 'in-progress');
}

export function getIncomingCall() {
    return calls.find(c => c.status === 'incoming') || getActiveCall();
}

export async function registerVideoCall(
    callUUID: string | undefined,
    videoRoomSID: string,
    consultationID: string,
    caller: VideoCallParticipant,
    callStatus?: string,
) {
    const call: VideoCall = {
        uuid: callUUID || (await getNewCallUUID()),
        videoRoomSID,
        consultationID,
        caller,
        status: callStatus || 'incoming',
        isCallMuted: false,
        isCallHeld: false,
    };

    calls.push(call);

    AppRegistry.registerHeadlessTask(
        'RNHelloDoctorIncomingVideoCallService',
        // @ts-ignore
        () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    const incomingCall = getCallByUUID(call.uuid);

                    if (incomingCall?.status === 'incoming') {
                        tryCancelVideoCallNotification(incomingCall.videoRoomSID,).finally(() => {
                            resolve(undefined);
                        });
                    }
                }, 45000);
            });
        },
    );

    return call;
}

export function handleIncomingVideoCallStarted(videoRoomSID: string) {
    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (!call) {
        console.warn(`[handleIncomingVideoCallStarted] cannot start ${videoRoomSID}: no call found`);
        return;
    }

    call.status = 'in-progress';
}

export async function tryCancelVideoCallNotification(videoRoomSID: string) {
    if (Platform.OS === 'android') {
        await RNHelloDoctorModule.rejectIncomingCallNotification();
    } else {
        const call = calls.find(c => c.videoRoomSID === videoRoomSID);

        if (call === undefined) {
            RNCallKeep.endAllCalls();
        } else {
            RNCallKeep.endCall(call.uuid);
        }
    }
}

export async function endVideoCall(videoRoomSID: string) {
    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (!call) {
        console.warn(`[endVideoCall] cannot end CallKeep call: no call found for room ${videoRoomSID}`);
        return;
    }

    RNCallKeep.endCall(call.uuid);

    if (call.status === 'completed') {
        console.info(`[endConsultationVideoCall:${videoRoomSID}]: call has already been completed`,);
        return;
    }

    call.status = 'completed';

    await VideoService.endVideoCall(videoRoomSID).catch(error =>
        console.warn(`error ending video call ${videoRoomSID}`, error),
    );

    navigateOnEndCall(call.consultationID, videoRoomSID);
}

export async function rejectVideoCall(videoRoomSID: string) {
    const call = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (!call) {
        console.warn(`no call found for room ${videoRoomSID}`);
        return;
    }

    call.status = 'completed';

    await VideoService.endVideoCall(videoRoomSID);

    RNCallKeep.rejectCall(call.uuid);

    pingIntegrationStep('video-call-rejected');
}

export async function registerPushKitCall(notification: {callUUID: string, videoRoomSID: string, consultationID: string, callerDisplayName: string}) {
    const {
        callUUID,
        videoRoomSID,
        consultationID,
        callerDisplayName,
    } = notification;

    const existingCall = calls.find(c => c.videoRoomSID === videoRoomSID);

    if (existingCall) {
        console.info(
            'already have call existing incoming call, skipping',
            existingCall,
        );
        return;
    }

    const caller = {
        displayName: callerDisplayName,
    };

    await registerVideoCall(
        callUUID,
        videoRoomSID,
        consultationID,
        caller,
    );
}
