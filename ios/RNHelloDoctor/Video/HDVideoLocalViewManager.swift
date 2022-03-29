//
//  HDVideoLocalViewManager.swift
//  RNHelloDoctor
//
//  Created by HelloDoctor on 3/29/22.
//

import Foundation
import TwilioVideo
import UIKit

@objc(HDVideoLocalViewManager)
class HDVideoLocalViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        let container = UIView()
        let inner = VideoView()
        inner.autoresizingMask = [.flexibleHeight, .flexibleWidth]
        inner.contentMode = .scaleAspectFill
        
        container.addSubview(inner)
        
        let hdVideo = HDVideo.getInstance()
        hdVideo.setLocalView(view:inner)
        
        return container
    }
}
