//
//  HDVideoRemoteViewManager.m
//  hellodoctor
//
//  Created by HelloDoctor on 9/12/20.
//

#import "HDVideoRemoteViewManager.h"

#import <React/RCTConvert.h>
#import <TwilioVideo/TwilioVideo.h>

@interface HDVideoTrackIdentifier : NSObject

@property (strong) NSString *participantSID;
@property (strong) NSString *videoTrackSID;

@end

@implementation HDVideoTrackIdentifier

@end


@interface RCTConvert(HDVideoTrackIdentifier)

+ (HDVideoTrackIdentifier *)HDVideoTrackIdentifier:(id)json;

@end

@implementation RCTConvert(HDVideoTrackIdentifier)

+ (HDVideoTrackIdentifier *)HDVideoTrackIdentifier:(id)json {
  HDVideoTrackIdentifier *trackIdentifier = [[HDVideoTrackIdentifier alloc] init];
  trackIdentifier.participantSID = json[@"participantSID"];
  trackIdentifier.videoTrackSID = json[@"videoTrackSID"];

  return trackIdentifier;
}

@end


@interface HDVideoRemoteViewManager()
@end

@implementation HDVideoRemoteViewManager

RCT_EXPORT_MODULE()

RCT_CUSTOM_VIEW_PROPERTY(scalesType, NSInteger, TVIVideoView) {
  view.subviews[0].contentMode = [RCTConvert NSInteger:json];
}

- (UIView *)view {
    UIView *container = [[UIView alloc] init];

    TVIVideoView *inner = [[TVIVideoView alloc] init];
    inner.autoresizingMask = (UIViewAutoresizingFlexibleHeight | UIViewAutoresizingFlexibleWidth);
    inner.contentMode = UIViewContentModeScaleAspectFill;
    [container addSubview:inner];

    return container;
}

RCT_CUSTOM_VIEW_PROPERTY(participantSID, NSString, TVIVideoView) {
    if (json) {
//        HDVideo *hdVideo = [HDVideo getInstance];
//        NSString *participantSID = [RCTConvert NSString:json];
//
//        [hdVideo addParticipantViewWithView:view.subviews[0] sid:participantSID];
    }
}

@end
