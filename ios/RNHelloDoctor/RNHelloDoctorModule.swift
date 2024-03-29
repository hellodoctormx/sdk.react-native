//
//  RNHDVideoModule.swift
//  RNHelloDoctor
//
//  Created by HelloDoctor on 3/29/22.
//

import Foundation
import React

@objc(RNHelloDoctorModule)
class RNHelloDoctorModule: RCTEventEmitter {
    private var hasListeners = false
    private var delayedEvents: Array<Dictionary<String, Any?>> = []
    
    private static var instance: RNHelloDoctorModule?
    
    override init() {
        super.init()
        HDEventEmitter.sharedInstance.registerEventEmitter(eventEmitter: self)
        
        RNHelloDoctorModule.instance = self
    }
    
    static func getInstance() -> RNHelloDoctorModule {
        if (RNHelloDoctorModule.instance == nil) {
            RNHelloDoctorModule.instance = RNHelloDoctorModule()
        }
        
        return RNHelloDoctorModule.instance!
    }

    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    @objc override func startObserving() -> Void {
        hasListeners = true

        if (!delayedEvents.isEmpty) {
            sendEvent(withName: "RNCallKeepDidLoadWithEvents", body: delayedEvents)
            delayedEvents.removeAll()
        }
    }

    @objc override func stopObserving() -> Void {
        hasListeners = false
    }

    func dispatch(name: String, body: Dictionary<String, Any>?) {
        if (hasListeners) {
            sendEvent(withName: name, body: body)
        } else {
            delayedEvents.append(["name": name, "data": body])
        }
    }

    @objc(getAPNSToken:reject:)
    func getAPNSToken(_ resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        resolve(RNHelloDoctorVideo.apnsToken)
    }

    @objc(configure:serviceHost:resolve:reject:)
    func configure(_ apiKey:String, serviceHost:String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        NSLog("`configure` is a no-op on ios")
        NSLog("[apiKey:\(apiKey)] [serviceHost:\(serviceHost)")
        resolve("no-op")
    }

    @objc(signIn:serverAuthToken:resolve:reject:)
    func signIn(_ userID:String, serverAuthToken:String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        NSLog("`signIn` is a no-op on ios")
        NSLog("[userID:\(userID)] [serverAuthToken:\(serverAuthToken)")
        resolve("no-op")
    }

    @objc(signInWithJWT:bearerToken:resolve:reject:)
    func signInWithJWT(_ userID:String, bearerToken:String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        NSLog("`signInWithJWT` is a no-op on ios")
        NSLog("[apiKey:\(userID)] [serviceHost:\(bearerToken)")
        resolve("no-op")
    }

    @objc(cancelIncomingCallNotification:reject:)
    func cancelIncomingCallNotification(_ resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        NSLog("`cancelIncomingCallNotification` is a no-op on ios")
        resolve("no-op")
    }

    @objc(connect:accessToken:resolve:reject:)
    func connect(_ roomName:String, accessToken:String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        HDVideo.instance.connect(roomName: roomName, accessToken: accessToken)

        resolve("connected")
    }

    @objc(isConnectedToRoom:resolve:reject:)
    func isConnectedTo(_ roomName: String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let isConnected = HDVideo.instance.isConnectedTo(roomName: roomName)

        resolve("\(isConnected)")
    }

    @objc(getRemoteParticipants:reject:)
    func getRemoteParticipants(_ resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        let remoteParticipants = HDVideo.instance.getRemoteParticipants()

        resolve(remoteParticipants)
    }

    @objc(disconnect:reject:)
    func disconnect(_ resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        HDVideo.instance.disconnect()

        resolve("disconnected")
    }

    @objc(setVideoPublished:resolve:reject:)
    func setVideoPublished(_ isPublished: Bool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        HDVideo.instance.setLocalVideoPublished(published: isPublished)

        resolve("set local video published: \(isPublished)")
    }

    @objc(setVideoEnabled:resolve:reject:)
    func setVideoEnabled(_ isEnabled: Bool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        HDVideo.instance.setLocalVideoEnabled(enabled: isEnabled)

        resolve("set local video enabled: \(isEnabled)")
    }

    @objc(setAudioEnabled:resolve:reject:)
    func setAudioEnabled(_ isEnabled: Bool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        HDVideo.instance.setLocalAudioEnabled(enabled: isEnabled)

        resolve("set local audio enabled: \(isEnabled)")
    }

    @objc(setSpeakerPhone:resolve:reject:)
    func setSpeakerPhone(_ isEnabled: Bool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        HDVideo.instance.setSpeakerEnabled(enabled: isEnabled)

        resolve("set speaker enabled: \(isEnabled)")
    }

    @objc(flipCamera:reject:)
    func flipCamera(_ resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        HDVideo.instance.flipCamera()

        resolve("flipped camera")
    }

    @objc open override func supportedEvents() -> [String] {
        return HDEventEmitter.sharedInstance.allEvents
    }
}
