@objc(HDEventEmitter)
public class HDEventEmitter: NSObject {

    /// Shared Instance.
    public static var sharedInstance = HDEventEmitter()

    // ReactNativeEventEmitter is instantiated by React Native with the bridge.
    private static var eventEmitter: RNHelloDoctorModule!

    // When React Native instantiates the emitter it is registered here.
    func registerEventEmitter(eventEmitter: RNHelloDoctorModule) {
        HDEventEmitter.eventEmitter = eventEmitter
    }

    @objc
    public static func dispatch(name: String, body: Any?) {
        HDEventEmitter.eventEmitter.dispatch(name: name, body: body)
    }

    /// All Events which must be support by React Native.
    var allEvents: [String] = {
        return [
            "localViewStatus",
            "connectedToRoom",
            "participantRoomConnectionEvent",
            "participantVideoEvent",
            "participantAudioEvent",
            "viewDidReceiveData",
            "incomingPushKitVideoCall",
            "RNCallKeepHandleStartCallNotification",
            "RNCallKeepDidReceiveStartCallAction",
            "RNCallKeepPerformAnswerCallAction",
            "RNCallKeepPerformEndCallAction",
            "RNCallKeepDidActivateAudioSession",
            "RNCallKeepDidDeactivateAudioSession",
            "RNCallKeepDidDisplayIncomingCall",
            "RNCallKeepDidPerformSetMutedCallAction",
            "RNCallKeepDidPerformDTMFAction",
            "RNCallKeepDidToggleHoldAction",
            "RNCallKeepProviderReset",
            "RNCallKeepCheckReachability",
            "RNCallKeepDidChangeAudioRoute",
            "RNCallKeepDidLoadWithEvents"
        ]
    }()

}
