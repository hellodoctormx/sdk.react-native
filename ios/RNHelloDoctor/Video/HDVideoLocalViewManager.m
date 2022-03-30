//
//  HDOLocalVideoViewManager.m
//  hellodoctor
//
//  Created by HelloDoctor on 9/12/20.
//

#import <Foundation/Foundation.h>
#import <CoreMedia/CMFormatDescription.h>
#import <React/RCTViewManager.h>
#import <TwilioVideo/TwilioVideo.h>
#import "HDVideoLocalViewManager.h"
#import "RNHelloDoctor-Swift.h"

@interface HDVideoLocalViewManager()

@end

@implementation HDVideoLocalViewManager

//+ (BOOL)requiresMainQueueSetup
//{
//    return YES;  // only do this if your module initialization relies on calling UIKit!
//}

RCT_EXPORT_MODULE()

- (UIView *)view
{
    NSLog(@"[HDVideoLocalViewManager] creating new view");

    UIView *container = [[UIView alloc] init];
    TVIVideoView *inner = [[TVIVideoView alloc] init];
    inner.autoresizingMask = (UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth);
    inner.contentMode = UIViewContentModeScaleAspectFill;

    [container addSubview:inner];

    HDVideo* hdVideo = [HDVideo getInstance];
    [hdVideo setLocalViewWithView:inner];

    return container;
}

@end
