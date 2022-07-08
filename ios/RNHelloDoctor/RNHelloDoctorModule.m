#import "RNHelloDoctorModule.h"


@interface RCT_EXTERN_MODULE(RNHelloDoctorModule, RCTEventEmitter)

RCT_EXTERN_METHOD(supportedEvents)

RCT_EXTERN_METHOD(
  getAPNSToken: (RCTPromiseResolveBlock)resolve
  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  configure: (NSString*)apiKey
  serviceHost: (NSString*)serviceHost
  resolve: (RCTPromiseResolveBlock)resolve
  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  signIn: (NSString*)userID
  serverAuthToken: (NSString*)serverAuthToken
  resolve: (RCTPromiseResolveBlock)resolve
  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  signInWithJWT: (NSString*)userID
  bearerToken: (NSString*)bearerToken
  resolve: (RCTPromiseResolveBlock)resolve
  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  cancelIncomingCallNotification: (RCTPromiseResolveBlock)resolve
  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  connect: (NSString*)roomName
  accessToken: (NSString*)accessToken
  resolve: (RCTPromiseResolveBlock)resolve
  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(isConnectedTo: (NSString*)roomName
                  resolve: (RCTPromiseResolveBlock)resolve
                  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(getRemoteParticipants: (RCTPromiseResolveBlock)resolve
                  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(disconnect: (RCTPromiseResolveBlock)resolve
                  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(startLocalCapture: (RCTPromiseResolveBlock)resolve
                  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(stopLocalCapture: (RCTPromiseResolveBlock)resolve
                  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(setVideoPublished: (BOOL*)isPublished
                  resolve: (RCTPromiseResolveBlock)resolve
                  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(setVideoEnabled: (BOOL*)isEnabled
                  resolve: (RCTPromiseResolveBlock)resolve
                  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(setAudioEnabled: (BOOL*)isEnabled
                  resolve: (RCTPromiseResolveBlock)resolve
                  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(setSpeakerPhone: (BOOL*)isEnabled
                  resolve: (RCTPromiseResolveBlock)resolve
                  reject: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(flipCamera: (RCTPromiseResolveBlock)resolve
                  reject: (RCTPromiseRejectBlock)reject
)

@end

