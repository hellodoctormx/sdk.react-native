//
//  Promise.h
//  hellodoctor
//
//  Created by HelloDoctor on 3/21/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#ifndef HDPromise_h
#define HDPromise_h

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface HDPromise : NSObject

@property (nonatomic) RCTPromiseResolveBlock resolve;
@property (nonatomic) RCTPromiseRejectBlock reject;

- (instancetype) initWithResolver:(RCTPromiseResolveBlock)resolve andRejecter:(RCTPromiseRejectBlock)reject;
- (void)resolve:(id)result;
- (void)reject:(NSString *)reason;
- (void)reject:(NSString *)reason withError:(NSError *)error;

@end

#endif /* HDPromise_h */
