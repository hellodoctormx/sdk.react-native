//
//  RNEventEmitter.swift
//  hellodoctor
//
//  Created by HelloDoctor on 3/29/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation

@objc(RNEventEmitter)
open class RNEventEmitter: RCTEventEmitter {
  
  override init() {
    super.init()
    EventEmitter.sharedInstance.registerEventEmitter(eventEmitter: self)
  }
  
  public override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  /// Base overide for RCTEventEmitter.
  ///
  /// - Returns: all supported events
  @objc open override func supportedEvents() -> [String] {
    return EventEmitter.sharedInstance.allEvents
  }
  
}
