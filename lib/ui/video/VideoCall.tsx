import React, {useState, useEffect, ReactElement} from 'react';
import VideoCallView from './VideoCallView';
import {LocalVideoView} from './native';
import {getIncomingCall} from '../../telecom/connectionManager';
import {navigateOnEndCall} from '../../telecom/eventHandlers';
import videoServiceApi from '../../api/video';

type VideoCallProps = {
    videoRoomSID: string;
    consultationID: string;
    accessToken: string;
}

export default function VideoCall(props: VideoCallProps): ReactElement {
    const [videoRoomSID, setVideoRoomSID] = useState(props.videoRoomSID);
    const [consultationID, setConsultationID] = useState(props.consultationID);
    const [accessToken, setAccessToken] = useState(props.accessToken);

    useEffect(() => {
        doBootstrapCall();
    }, []);

    useEffect(() => {
        if (videoRoomSID && !accessToken) {
            doRequestAccessToken();
        }
    }, [videoRoomSID]);

    function doBootstrapCall() {
        if (!videoRoomSID) {
            // This call is being answered from a notification, and thus won't have the props set
            const incomingCall = getIncomingCall();

            if (!incomingCall) {
                console.warn(
                    '[HDVideoCall:doBootstrapCall] no incoming call found',
                );
                navigateOnEndCall(consultationID, videoRoomSID);
                return;
            }

            setVideoRoomSID(incomingCall.videoRoomSID);
            setConsultationID(incomingCall.consultationID);
        }
    }

    function doRequestAccessToken() {
        videoServiceApi
            .requestVideoCallAccess(videoRoomSID)
            .then(({accessToken}) => setAccessToken(accessToken))
            .catch(error => {
                console.warn(
                    '[HDVideoCall:doRequestAccessToken] aborting call due to error:',
                    error,
                );
                navigateOnEndCall(consultationID, videoRoomSID);
            });
    }

    return (
        <React.Fragment>
            {!accessToken && (
                <LocalVideoView style={{width: '100%', height: '100%'}} />
            )}
            {accessToken && (
                <VideoCallView
                    videoRoomSID={videoRoomSID}
                    consultationID={consultationID}
                    accessToken={accessToken}
                />
            )}
        </React.Fragment>
    );
}
