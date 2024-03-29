//
//  HDVideoLocalViewManager.swift
//  RNHelloDoctor
//
//  Created by HelloDoctor on 3/29/22.
//

import Foundation
import TwilioVideo
import UIKit

@objc(HDVideoRemoteViewManager)
class HDVideoRemoteViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func view() -> UIView! {
        return HDVideoView()
    }
}
