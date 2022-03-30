
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(HDVideoModule, NSObject)

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
