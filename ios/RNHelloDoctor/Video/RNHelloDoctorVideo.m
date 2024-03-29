/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "RNHelloDoctorVideo.h"
#import "RNHelloDoctor-Swift.h"

#import "RNCallKeep.h"
#import "RNVoipPushNotificationManager.h"

@implementation RNHelloDoctorVideo

static NSString* _apnsToken;

+ (NSString*) apnsToken {
    return _apnsToken;
}

+ (void) setApnsToken:(NSString*) apnsToken {
    _apnsToken = apnsToken;
}

+ (void)configure:(NSString *)appName
{
    [RNCallKeep setup:@{
        @"appName": appName,
        @"supportsVideo": @YES,
      }];

    [RNVoipPushNotificationManager voipRegistration];
}

// --- Handle updated push credentials
+ (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type {
  // Register VoIP push token (a property of PKPushCredentials) with server
    NSUInteger voipTokenLength = credentials.token.length;
    if (voipTokenLength == 0) {
        return;
    }

    NSMutableString *hexString = [NSMutableString string];
    const unsigned char *bytes = credentials.token.bytes;
    for (NSUInteger i = 0; i < voipTokenLength; i++) {
        [hexString appendFormat:@"%02x", bytes[i]];
    }

    [RNHelloDoctorVideo setApnsToken:[hexString copy]];
}

+ (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type
{
  // --- The system calls this method when a previously provided push token is no longer valid for use. No action is necessary on your part to reregister the push type. Instead, use this method to notify your server not to send push notifications using the matching push token.
}

// --- Handle incoming pushes
+ (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
    NSString *callUUID = payload.dictionaryPayload[@"callUUID"];
    NSString *callerDisplayName = payload.dictionaryPayload[@"callerDisplayName"];
    NSString *videoRoomSID = payload.dictionaryPayload[@"videoRoomSID"];

    if (callerDisplayName == (id)[NSNull null] || callerDisplayName.length == 0) {
        callerDisplayName = @"Médico de HelloDoctor";
    }

    [HDEventEmitter dispatchWithName:@"incomingPushKitVideoCall" body:payload.dictionaryPayload];

    [RNCallKeep reportNewIncomingCall:callUUID handle:videoRoomSID handleType:@"generic" hasVideo:true localizedCallerName:callerDisplayName supportsHolding:true supportsDTMF:false supportsGrouping:false supportsUngrouping:false fromPushKit:YES payload:nil withCompletionHandler:completion];
}

@end
