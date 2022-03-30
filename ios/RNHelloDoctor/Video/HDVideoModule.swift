//
//  HDVideoModule.swift
//  RNHelloDoctor
//
//  Created by HelloDoctor on 3/29/22.
//

import Foundation

@objc(HDVideoModule)
class HDVideoModule: RCTEventEmitter {
    @objc(connect:withAccessToken:withResolver:withRejecter:)
    func connect(roomName: String, accessToken: String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.connect(roomName: roomName, accessToken: accessToken)
        
        resolve("connected")
    }
    
    @objc(isConnectedToRoom:withResolver:withRejecter:)
    func connect(roomName: String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        
        let isConnected = hdVideo.isConnectedTo(roomName: roomName)
        
        resolve("\(isConnected)")
    }
    
    @objc(getRemoteParticipants:withRejecter:)
    func getRemoteParticipants(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        
        let remoteParticipants = hdVideo.getRemoteParticipants()
        
        resolve(remoteParticipants)
    }
    
    @objc(disconnect:withRejecter:)
    func disconnect(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.disconnect()
        
        resolve("disconnected")
    }
    
    @objc(setVideoPublished:withResolver:withRejecter:)
    func setVideoPublished(isPublished: Bool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.setLocalVideoPublished(published: isPublished)
        
        resolve("set local video published: \(isPublished)")
    }
    
    @objc(setVideoEnabled:withResolver:withRejecter:)
    func setVideoEnabled(isEnabled: Bool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.setLocalVideoEnabled(enabled: isEnabled)
        
        resolve("set local video enabled: \(isEnabled)")
    }
    
    @objc(setAudioEnabled:withResolver:withRejecter:)
    func setAudioEnabled(isEnabled: Bool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.setLocalAudioEnabled(enabled: isEnabled)
        
        resolve("set local audio enabled: \(isEnabled)")
    }
    
    @objc(setSpeakerPhone:withResolver:withRejecter:)
    func setSpeakerPhone(isEnabled: Bool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.setSpeakerEnabled(enabled: isEnabled)
        
        resolve("set speaker enabled: \(isEnabled)")
    }
    
    @objc(flipCamera:withRejecter:)
    func flipCamera(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let hdVideo = HDVideo.getInstance()
        hdVideo.flipCamera()
        
        resolve("flipped camera")
    }
}
