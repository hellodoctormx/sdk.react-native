//
//  EventEmitter.swift
//  hellodoctor
//
//  Created by HelloDoctor on 3/29/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

class EventEmitter {

    /// Shared Instance.
    public static var sharedInstance = EventEmitter()

    // ReactNativeEventEmitter is instantiated by React Native with the bridge.
    private static var eventEmitter: HDEventEmitter!

    private init() {}

    // When React Native instantiates the emitter it is registered here.
    func registerEventEmitter(eventEmitter: HDEventEmitter) {
        EventEmitter.eventEmitter = eventEmitter
    }

    static func dispatch(name: String, body: Any?) {
        eventEmitter.sendEvent(withName: name, body: body)
    }

    /// All Events which must be support by React Native.
    lazy var allEvents: [String] = {
        var allEventNames: [String] = [
            "localViewStatus",
            "connectedToRoom",
            "participantRoomConnectionEvent",
            "participantVideoEvent",
            "participantAudioEvent",
            "viewDidReceiveData"
        ]
        
        return allEventNames
    }()

}
