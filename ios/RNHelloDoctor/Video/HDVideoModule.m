//
//  VideoModule.m
//  hellodoctor
//
//  Created by HelloDoctor on 3/21/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

#import "HDVideoModule.h"

@implementation HDVideoModule
//
//+ (BOOL)requiresMainQueueSetup
//{
//    return YES;
//}
//

RCT_EXPORT_MODULE(HDVideo)

RCT_REMAP_METHOD(connect,
                 connectToRoom:(NSString*)roomName
                 withAccessToken:(NSString*)token
                 connectToRoomResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    HDVideo* hdVideo = [HDVideo getInstance];
    
    [hdVideo connectWithRoomName:roomName accessToken:token];
    
    resolve(@"connected");
}

RCT_REMAP_METHOD(isConnectedToRoom,
                 isConnectToRoom:(NSString*)roomName
                 isConnectedResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    HDVideo* hdVideo = [HDVideo getInstance];
    
    BOOL isConnected = [hdVideo isConnectedToRoomName:roomName];
    
    resolve([NSString stringWithFormat:@"%d", isConnected]);
}

RCT_REMAP_METHOD(getRemoteParticipants,
                 getRemoteParticipants:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    HDVideo* hdVideo = [HDVideo getInstance];
    
    NSArray* remoteParticipants = [hdVideo getRemoteParticipants];
    
    resolve(remoteParticipants);
}

RCT_REMAP_METHOD(disconnect,
                 disconnectResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    HDVideo* hdVideo = [HDVideo getInstance];
    
    [hdVideo disconnect];
    
    resolve(@"disconnected");
}

RCT_REMAP_METHOD(setVideoPublished,
                 isPublished:(BOOL)published
                 enableVideoResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    HDVideo* hdVideo = [HDVideo getInstance];
    
    [hdVideo setLocalVideoPublishedWithPublished:published];
    
    resolve([NSString stringWithFormat:@"local video published: %d", published]);
}

RCT_REMAP_METHOD(setVideoEnabled,
                 isEnabled:(BOOL)enabled
                 enableVideoResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    HDVideo* hdVideo = [HDVideo getInstance];
    
    [hdVideo setLocalVideoEnabledWithEnabled:enabled];
    
    resolve([NSString stringWithFormat:@"local video enabled: %d", enabled]);
}

RCT_REMAP_METHOD(setAudioEnabled,
                 isEnabled:(BOOL)enabled
                 enableAudioResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    HDVideo* hdVideo = [HDVideo getInstance];
    
    [hdVideo setLocalAudioEnabledWithEnabled:enabled];
    
    resolve([NSString stringWithFormat:@"local audio enabled: %d", enabled]);
}

RCT_REMAP_METHOD(setSpeakerPhone,
                 withSpeakerEnabled:(BOOL)enabled
                 setSpeakerPhoneResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    HDVideo* hdVideo = [HDVideo getInstance];
    
    [hdVideo setSpeakerEnabledWithEnabled:enabled];
    
    resolve(@"success");
}

RCT_REMAP_METHOD(flipCamera,
                 flipCameraResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
    HDVideo* hdVideo = [HDVideo getInstance];
    
    [hdVideo flipCamera];
    
    resolve(@"success");
}

@end
