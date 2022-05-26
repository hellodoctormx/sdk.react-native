/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "RNHelloDoctorVideo.h"

#import "RNCallKeep.h"
#import "RNVoipPushNotificationManager.h"

@implementation RNHelloDoctorVideo

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
  [RNVoipPushNotificationManager didUpdatePushCredentials:credentials forType:(NSString *)type];
}

+ (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type
{
  // --- The system calls this method when a previously provided push token is no longer valid for use. No action is necessary on your part to reregister the push type. Instead, use this method to notify your server not to send push notifications using the matching push token.
}

// --- Handle incoming pushes
+ (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
    NSString *uuid = payload.dictionaryPayload[@"uuid"];
    NSString *callerDisplayName = payload.dictionaryPayload[@"callerDisplayName"];
    NSString *videoRoomSID = payload.dictionaryPayload[@"videoRoomSID"];

    [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];

    [RNCallKeep reportNewIncomingCall:uuid handle:videoRoomSID handleType:@"generic" hasVideo:true localizedCallerName:callerDisplayName supportsHolding:true supportsDTMF:false supportsGrouping:false supportsUngrouping:false fromPushKit:YES payload:nil withCompletionHandler:completion];
}

@end
