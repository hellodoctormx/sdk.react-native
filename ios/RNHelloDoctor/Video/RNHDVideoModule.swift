//
//  RNHDVideoModule.swift
//  RNHelloDoctor
//
//  Created by HelloDoctor on 3/29/22.
//

import Foundation

@objc(RNHDVideoModule)
class RNHDVideoModule: NSObject {
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc(connect:accessToken:resolve:reject:)
    func connect(_ roomName:String, accessToken:String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.connect(roomName: roomName, accessToken: accessToken)

        resolve("connected")
    }

    @objc(isConnectedToRoom:resolve:reject:)
    func isConnectedTo(_ roomName: String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()

        let isConnected = hdVideo.isConnectedTo(roomName: roomName)

        resolve("\(isConnected)")
    }

    @objc(getRemoteParticipants:reject:)
    func getRemoteParticipants(_ resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()

        let remoteParticipants = hdVideo.getRemoteParticipants()

        resolve(remoteParticipants)
    }

    @objc(disconnect:reject:)
    func disconnect(_ resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.disconnect()

        resolve("disconnected")
    }

    @objc(setVideoPublished:resolve:reject:)
    func setVideoPublished(_ isPublished: Bool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.setLocalVideoPublished(published: isPublished)

        resolve("set local video published: \(isPublished)")
    }

    @objc(setVideoEnabled:resolve:reject:)
    func setVideoEnabled(_ isEnabled: Bool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.setLocalVideoEnabled(enabled: isEnabled)

        resolve("set local video enabled: \(isEnabled)")
    }

    @objc(setAudioEnabled:resolve:reject:)
    func setAudioEnabled(_ isEnabled: Bool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.setLocalAudioEnabled(enabled: isEnabled)

        resolve("set local audio enabled: \(isEnabled)")
    }

    @objc(setSpeakerPhone:resolve:reject:)
    func setSpeakerPhone(_ isEnabled: Bool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.setSpeakerEnabled(enabled: isEnabled)

        resolve("set speaker enabled: \(isEnabled)")
    }

    @objc(flipCamera:reject:)
    func flipCamera(_ resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.flipCamera()

        resolve("flipped camera")
    }
}
