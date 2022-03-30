//
//  RNEventEmitter.m
//  hellodoctor
//
//  Created by HelloDoctor on 3/29/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(HDEventEmitter, RCTEventEmitter)

RCT_EXTERN_METHOD(supportedEvents)

@end
