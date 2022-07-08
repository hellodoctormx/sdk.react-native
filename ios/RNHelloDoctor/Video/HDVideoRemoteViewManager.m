//
//  HDVideoRemoteViewManager.m
//  hellodoctor
//
//  Created by HelloDoctor on 9/12/20.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(HDVideoRemoteViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(participantSID, NSString)

@end
