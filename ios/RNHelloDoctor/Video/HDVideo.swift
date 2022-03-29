//
//  HDVideo.swift
//  hellodoctor
//
//  Created by HelloDoctor on 3/24/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation
import AVFoundation
import ReplayKit
import UIKit
import TwilioVideo


@objc class HDVideo: NSObject {
    // Video SDK components
    var room: Room?
    var camera: CameraSource?
    var audioDevice = DefaultAudioDevice()

    var localVideoTrack: LocalVideoTrack?
    var localAudioTrack: LocalAudioTrack?
    var remoteParticipant: RemoteParticipant?

    var portalParticipant : RemoteParticipant?
    var portalVideoTrack: RemoteVideoTrack?
    var portalParticipantView: VideoView!

    var participantVideoViews = [String:VideoView]()

    var localParticipantView: VideoView!
    var remoteParticipantView: VideoView?

    static var instance: HDVideo?

    deinit {
        DispatchQueue.main.async {
            UIApplication.shared.isIdleTimerDisabled = false
        }

        if let camera = self.camera {
            camera.stopCapture()
            self.camera = nil
            self.localVideoTrack = nil
            self.localAudioTrack = nil
        }

        HDVideo.instance = nil
    }

    @objc static func getInstance() -> HDVideo {
        while (instance == nil) {
            instance = HDVideo()
        }

        return instance!
    }

    @objc func setLocalView(view:VideoView) {
        localParticipantView = view
    }

    @objc func removeLocalView(view:VideoView) {
//        if let localVideoTrack = self.localVideoTrack {
//            localVideoTrack.removeRenderer(view)
//        }
    }

    @objc func setLocalVideoPublished(published:Bool) {
        if let room = self.room, let localVideoTrack = self.localVideoTrack {
            if published {
                room.localParticipant?.publishVideoTrack(localVideoTrack)
            } else {
                room.localParticipant?.unpublishVideoTrack(localVideoTrack)
            }
        }
    }

    @objc func setLocalVideoEnabled(enabled:Bool) {
        self.localVideoTrack?.isEnabled = enabled
    }

    @objc func setLocalAudioEnabled(enabled:Bool) {
        self.localAudioTrack?.isEnabled = enabled
    }

    @objc func unpublishLocalVideo() {
        if let room = self.room, let localVideoTrack = self.localVideoTrack {
            room.localParticipant?.unpublishVideoTrack(localVideoTrack)
        }
    }

    @objc func addParticipantView(view:VideoView, sid:String) {
        participantVideoViews[sid] = view

        if self.room == nil {
            logMessage(messageText: "cannot add participant \(sid): no room available")
            return
        }

        for participant in self.room!.remoteParticipants {
            if participant.identity == sid {
                _ = tryRenderRemoteParticipant(videoView: view, participant: participant)
            }
        }
    }

    @objc func setPortalView(view:VideoView) {
        self.portalParticipantView = view
    }

    @objc func setPortalParticipant(participantSID:String) {
        if let participant = self.room?.remoteParticipants.first(where: {remoteParticipant -> Bool in
            remoteParticipant.identity == participantSID
        }) {
            for publication in participant.remoteVideoTracks {
                if let subscribedVideoTrack = publication.remoteTrack, publication.isTrackSubscribed {
                    self.portalParticipant = participant

                    self.portalVideoTrack = subscribedVideoTrack
                    self.portalVideoTrack?.addRenderer(self.portalParticipantView)
                }
            }
        }
    }

    @objc func connect(roomName: String, accessToken: String) {
        startLocalCapture()

        let connectOptions = ConnectOptions(token: accessToken) { (builder) in
            builder.audioTracks = [self.localAudioTrack!]
            builder.videoTracks = [self.localVideoTrack!]
            builder.encodingParameters = EncodingParameters(audioBitrate: 16, videoBitrate: 0)
            builder.roomName = roomName
        }

        logMessage(messageText: "Attempting to connect to room \(roomName)")

        room = TwilioVideoSDK.connect(options: connectOptions, delegate: self)
    }

    @objc func isConnectedTo(roomName: String) -> Bool {
        if let room = self.room {
            return room.sid == roomName
        }

        return false
    }

    @objc func getRemoteParticipants() -> [String] {
        if let room = self.room {
            return room.remoteParticipants.map { remoteParticipant -> String in
                remoteParticipant.identity
            }
        } else {
            return []
        }
    }

    @objc func disconnect() {
        stopLocalCapture()

        if let room = self.room {
            logMessage(messageText: "Attempting to disconnect from room \(room.name)")

            room.disconnect()
            self.room = nil

            logMessage(messageText: "Disconnected from room \(room.name)")
        }
    }

    @objc func startLocalCapture() {
        logMessage(messageText: "starting local capture")

        prepareLocalMedia()

        let captureDevice = getAvailableCaptureDevice()

        camera!.startCapture(device: captureDevice, completion: { (captureDevice, videoFormat, error) in
            if let error = error {
                self.logMessage(messageText: "Capture failed with error.\ncode = \((error as NSError).code) error = \(error.localizedDescription)")
            } else {
                self.logMessage(messageText: "Local capture started")
            }
        });

        // TODO Why can localParticipantView be nil here? nil-check added as a stop-gap for crashes arising
        // from nil localParticipantView being added as a renderer
        if let localVideoTrack = self.localVideoTrack, let localParticipantView = self.localParticipantView {
            logMessage(messageText: "adding local view renderer")
            localVideoTrack.addRenderer(localParticipantView)
            localParticipantView.shouldMirror = true
        } else {
            logMessage(messageText: "error adding local view renderer: no local video track and/or local participant view")
        }
    }

    @objc func stopLocalCapture() {
        if let participant = self.room?.localParticipant, let videoTrack = self.localVideoTrack {
            participant.unpublishVideoTrack(videoTrack)

            for renderer in videoTrack.renderers {
                videoTrack.removeRenderer(renderer)
            }
        }

        self.camera?.stopCapture(completion: { (error) in
            if let _error = error {
                self.logMessage(messageText: "Error stopping capture: \(_error)")
            }

            self.camera = nil
            self.localVideoTrack = nil
            self.localAudioTrack = nil
        })
    }

    @objc func enableAudio() {
        if (self.localAudioTrack != nil) {
            self.localAudioTrack?.isEnabled = true
        }
    }

    @objc func disableAudio() {
        if (self.localAudioTrack != nil) {
            self.localAudioTrack?.isEnabled = false
        }
    }

    // MARK: AVAudioSession
    @objc func setSpeakerEnabled(enabled: Bool) {
//        let session = AVAudioSession.sharedInstance()
//        var _: Error?
//        try? session.setCategory(AVAudioSession.Category.playAndRecord)
//        try? session.setMode(AVAudioSession.Mode.videoChat)
//        if enabled {
//            try? session.overrideOutputAudioPort(AVAudioSession.PortOverride.speaker)
//        } else {
//            try? session.overrideOutputAudioPort(AVAudioSession.PortOverride.none)
//        }
//        try? session.setActive(true)
    }

    func prepareLocalMedia() {
        if (localAudioTrack == nil) {
            prepareLocalAudioTrack()
        }

        if (localVideoTrack == nil) {
            prepareLocalVideoTrack()
        }
    }

    func prepareLocalAudioTrack() {
//        TwilioVideoSDK.audioDevice = self.audioDevice

        let options = AudioOptions { (builder) in
            builder.isSoftwareAecEnabled = true
        }

        localAudioTrack = LocalAudioTrack(options: options, enabled: true, name: "Microphone")

        if (localAudioTrack == nil) {
            logMessage(messageText: "Failed to create local audio track")
        } else {
            setSpeakerEnabled(enabled:true)

            logMessage(messageText: "Created local audio track")
        }
    }

    func prepareLocalVideoTrack() {
        camera = CameraSource(delegate: self)
        localVideoTrack = LocalVideoTrack(source: camera!, enabled: true, name: "Camera")

        if localVideoTrack == nil {
            logMessage(messageText: "Failed to create local video track")
        } else {
            logMessage(messageText: "Created local video track")
        }
    }

    func getAvailableCaptureDevice() -> AVCaptureDevice {
        let frontCamera = CameraSource.captureDevice(position: .front)
        let backCamera = CameraSource.captureDevice(position: .back)

        return frontCamera != nil ? frontCamera! : backCamera!
    }

    @objc func flipCamera() {
        var newDevice: AVCaptureDevice?

        if let camera = self.camera, let captureDevice = camera.device {
            if captureDevice.position == .front {
                newDevice = CameraSource.captureDevice(position: .back)
            } else {
                newDevice = CameraSource.captureDevice(position: .front)
            }

            if let newDevice = newDevice {
                camera.selectCaptureDevice(newDevice) { (captureDevice, videoFormat, error) in
                    if let error = error {
                        self.logMessage(messageText: "Error selecting capture device.\ncode = \((error as NSError).code) error = \(error.localizedDescription)")
                    }
                }
            }
        }
    }

    func tryRenderRemoteParticipant(videoView : VideoView, participant : RemoteParticipant) -> Bool {
        for publication in participant.remoteVideoTracks {
            if let subscribedVideoTrack = publication.remoteTrack, publication.isTrackSubscribed {
                subscribedVideoTrack.addRenderer(videoView)

                let payload = [
                    "action": "renderedParticipant",
                    "participantIdentity": participant.identity
                ]

                EventEmitter.dispatch(name: "participantVideoEvent", body:payload)

                return true
            }
        }

        return false
    }

    func tryRenderPortalParticipant(participant : RemoteParticipant, portalView : VideoView) -> Bool {
        for publication in participant.remoteVideoTracks {
            if let subscribedVideoTrack = publication.remoteTrack, publication.isTrackSubscribed {
                self.portalParticipant = participant
                logMessage(messageText: "looking for \(participant.identity)")

                self.portalParticipantView = portalView
                self.portalVideoTrack = subscribedVideoTrack

//                self.portalVideoTrack!.addRenderer(self.portalParticipantView!)

                return true
            }
        }

        return false
    }

    func logMessage(messageText: String) {
        NSLog(messageText)
    }
}

// MARK:- RoomDelegate
extension HDVideo : RoomDelegate {
    func roomDidConnect(room: Room) {
        logMessage(messageText: "Connected to room \(room.name) as \(room.localParticipant?.identity ?? "")")

        UIApplication.shared.isIdleTimerDisabled = true

        self.room = room
        let participantIDs = room.remoteParticipants.map({ $0.identity })
        EventEmitter.dispatch(name: "connectedToRoom", body:["connected": "yes", "participants": participantIDs])

        for remoteParticipant in room.remoteParticipants {
            if let remoteParticipantVideoView = participantVideoViews[remoteParticipant.identity] {
                _ = tryRenderRemoteParticipant(videoView: remoteParticipantVideoView, participant: remoteParticipant)
            }
        }
    }

    func roomDidDisconnect(room: Room, error: Error?) {
        logMessage(messageText: "Disconnected from room \(room.name), error = \(String(describing: error))")

        self.room = nil

        UIApplication.shared.isIdleTimerDisabled = false
    }

    func roomDidFailToConnect(room: Room, error: Error) {
        logMessage(messageText: "Failed to connect to room with error = \(String(describing: error))")
        self.room = nil

        UIApplication.shared.isIdleTimerDisabled = false
    }

    func roomIsReconnecting(room: Room, error: Error) {
        logMessage(messageText: "Reconnecting to room \(room.name), error = \(String(describing: error))")
    }

    func roomDidReconnect(room: Room) {
        logMessage(messageText: "Reconnected to room \(room.name)")
    }

    func participantDidConnect(room: Room, participant: RemoteParticipant) {
        // Listen for events from all Participants to decide which RemoteVideoTrack to render.
        participant.delegate = self

        let payload = [
            "action": "connected",
            "participantIdentity": participant.identity
        ]

        EventEmitter.dispatch(name: "participantRoomConnectionEvent", body:payload)

        logMessage(messageText: "Participant \(participant.identity) connected with \(participant.remoteAudioTracks.count) audio and \(participant.remoteVideoTracks.count) video tracks")
    }

    func participantDidDisconnect(room: Room, participant: RemoteParticipant) {
        logMessage(messageText: "Room \(room.name), Participant \(participant.identity) disconnected")

        let payload = [
            "action": "disconnected",
            "participantIdentity": participant.identity
        ]

        EventEmitter.dispatch(name: "participantRoomConnectionEvent", body:payload)
    }
}

// MARK:- RemoteParticipantDelegate
extension HDVideo : RemoteParticipantDelegate {

    func remoteParticipantDidPublishVideoTrack(participant: RemoteParticipant, publication: RemoteVideoTrackPublication) {
        // Remote Participant has offered to share the video Track.

        logMessage(messageText: "Participant \(participant.identity) published \(publication.trackName) video track")

        let payload = [
            "action": "connected",
            "participantIdentity": participant.identity
        ]

        EventEmitter.dispatch(name: "participantVideoEvent", body:payload)

        if let remoteView = participantVideoViews[participant.identity] {
            _ = tryRenderRemoteParticipant(videoView: remoteView, participant: participant)
        }
    }

    func remoteParticipantDidUnpublishVideoTrack(participant: RemoteParticipant, publication: RemoteVideoTrackPublication) {
        // Remote Participant has stopped sharing the video Track.
        logMessage(messageText: "Participant \(participant.identity) unpublished \(publication.trackName) video track")
    }

    func remoteParticipantDidPublishAudioTrack(participant: RemoteParticipant, publication: RemoteAudioTrackPublication) {
        // Remote Participant has offered to share the audio Track.
        logMessage(messageText: "Participant \(participant.identity) published \(publication.trackName) audio track")
    }

    func remoteParticipantDidUnpublishAudioTrack(participant: RemoteParticipant, publication: RemoteAudioTrackPublication) {
        // Remote Participant has stopped sharing the audio Track.
        logMessage(messageText: "Participant \(participant.identity) unpublished \(publication.trackName) audio track")
    }

    func didSubscribeToVideoTrack(videoTrack: RemoteVideoTrack, publication: RemoteVideoTrackPublication, participant: RemoteParticipant) {
        // The LocalParticipant is subscribed to the RemoteParticipant's video Track. Frames will begin to arrive now.
        logMessage(messageText: "Subscribed to \(publication.trackName) video track for Participant \(participant.identity)")

        let payload = [
            "action": "connected",
            "participantIdentity": participant.identity
        ]

        EventEmitter.dispatch(name: "participantVideoEvent", body:payload)

        if let remoteView = participantVideoViews[participant.identity] {
            _ = tryRenderRemoteParticipant(videoView: remoteView, participant: participant)
        }
    }

    func didUnsubscribeFromVideoTrack(videoTrack: RemoteVideoTrack, publication: RemoteVideoTrackPublication, participant: RemoteParticipant) {
        // We are unsubscribed from the remote Participant's video Track. We will no longer receive the
        // remote Participant's video.

        logMessage(messageText: "Unsubscribed from \(publication.trackName) video track for Participant \(participant.identity)")

        let payload = [
            "action": "disconnected",
            "participantIdentity": participant.identity
        ]

        EventEmitter.dispatch(name: "participantVideoEvent", body:payload)

        for renderer in videoTrack.renderers {
//            videoTrack.removeRenderer(renderer);
        }
    }

    func didSubscribeToAudioTrack(audioTrack: RemoteAudioTrack, publication: RemoteAudioTrackPublication, participant: RemoteParticipant) {
        // We are subscribed to the remote Participant's audio Track. We will start receiving the
        // remote Participant's audio now.

        logMessage(messageText: "Subscribed to \(publication.trackName) audio track for Participant \(participant.identity)")
    }

    func didUnsubscribeFromAudioTrack(audioTrack: RemoteAudioTrack, publication: RemoteAudioTrackPublication, participant: RemoteParticipant) {
        // We are unsubscribed from the remote Participant's audio Track. We will no longer receive the
        // remote Participant's audio.

        logMessage(messageText: "Unsubscribed from \(publication.trackName) audio track for Participant \(participant.identity)")
    }

    func remoteParticipantDidEnableVideoTrack(participant: RemoteParticipant, publication: RemoteVideoTrackPublication) {
        logMessage(messageText: "Participant \(participant.identity) enabled \(publication.trackName) video track")

        let payload = [
            "action": "enabledVideo",
            "participantIdentity": participant.identity
        ]

        EventEmitter.dispatch(name: "participantVideoEvent", body:payload)
    }

    func remoteParticipantDidDisableVideoTrack(participant: RemoteParticipant, publication: RemoteVideoTrackPublication) {
        logMessage(messageText: "Participant \(participant.identity) disabled \(publication.trackName) video track")

        let payload = [
            "action": "disabledVideo",
            "participantIdentity": participant.identity
        ]

        EventEmitter.dispatch(name: "participantVideoEvent", body:payload)
    }

    func remoteParticipantDidEnableAudioTrack(participant: RemoteParticipant, publication: RemoteAudioTrackPublication) {
        logMessage(messageText: "Participant \(participant.identity) enabled \(publication.trackName) audio track")

        let payload = [
            "action": "enabledAudio",
            "participantIdentity": participant.identity
        ]

        EventEmitter.dispatch(name: "participantAudioEvent", body:payload)
    }

    func remoteParticipantDidDisableAudioTrack(participant: RemoteParticipant, publication: RemoteAudioTrackPublication) {
        logMessage(messageText: "Participant \(participant.identity) disabled \(publication.trackName) audio track")

        let payload = [
            "action": "disabledAudio",
            "participantIdentity": participant.identity
        ]

        EventEmitter.dispatch(name: "participantAudioEvent", body:payload)
    }

    func didFailToSubscribeToAudioTrack(publication: RemoteAudioTrackPublication, error: Error, participant: RemoteParticipant) {
        logMessage(messageText: "FailedToSubscribe \(publication.trackName) audio track, error = \(String(describing: error))")
    }

    func didFailToSubscribeToVideoTrack(publication: RemoteVideoTrackPublication, error: Error, participant: RemoteParticipant) {
        logMessage(messageText: "FailedToSubscribe \(publication.trackName) video track, error = \(String(describing: error))")
    }
}

// MARK:- VideoViewDelegate
extension HDVideo : VideoViewDelegate {
    func videoViewDimensionsDidChange(view: VideoView, dimensions: CMVideoDimensions) {
        logMessage(messageText: "videoViewDimensionsDidChange")
        logMessage(messageText: "changed frame dimensions: \(view.frame.height) x \(view.frame.width)")
        logMessage(messageText: "changed video dimensions: \(view.videoDimensions.height) x \(view.videoDimensions.width)")
        view.setNeedsLayout()
    }

    func videoViewDidReceiveData(view: VideoView) {
        logMessage(messageText: "videoViewDidReceiveData")
        logMessage(messageText: "frame dimensions: \(view.frame.height) x \(view.frame.width)")
        logMessage(messageText: "video dimensions: \(view.videoDimensions.height) x \(view.videoDimensions.width)")
    }
}

// MARK:- CameraSourceDelegate
extension HDVideo : CameraSourceDelegate {
    func cameraSourceDidFail(source: CameraSource, error: Error) {
        logMessage(messageText: "Camera source failed with error: \(error.localizedDescription)")
    }
}

// MARK:- CameraSourceDelegate
extension HDVideo : LocalParticipantDelegate {
    func didPublishVideoTrack(participant: LocalParticipant, publication: LocalVideoTrackPublication) {
        logMessage(messageText: "Local Participant \(participant.identity) published \(publication.trackName) video track")
    }

    func didFailToPublishVideoTrack(participant: LocalParticipant, videoTrack: LocalVideoTrack, error: Error) {
        logMessage(messageText: "Local Participant \(participant.identity) failed to publishvideo track")
    }
}
