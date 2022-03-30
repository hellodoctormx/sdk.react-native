//
//  Promise.m
//  hellodoctor
//
//  Created by HelloDoctor on 3/21/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>

#import "HDPromise.h"

@implementation HDPromise

- (instancetype) initWithResolver:(RCTPromiseResolveBlock)resolve andRejecter:(RCTPromiseRejectBlock)reject {
  self = [super init];
  
  self.resolve = resolve;
  self.reject = reject;
  
  return self;
}

- (void)resolve:(id)result {
  self.resolve(result);
}

- (void)reject:(NSString *)reason {
  NSLog(@"%@", reason);
  
  self.reject(@"", reason, nil);
}

- (void)reject:(NSString *)reason withError:(NSError *)error {
  NSLog(reason, error);
  
  self.reject(@"", reason, error);
}

@end

