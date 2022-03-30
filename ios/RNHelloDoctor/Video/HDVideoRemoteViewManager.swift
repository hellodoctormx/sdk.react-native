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
    var container: UIView
    var videoView: VideoView

    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func view() -> UIView! {
        container = UIView()

        videoView = VideoView()
        videoView.autoresizingMask = [.flexibleHeight, .flexibleWidth]
        videoView.contentMode = .scaleAspectFill

        container.addSubview(videoView)

        let hdVideo = HDVideo.getInstance()
        hdVideo.setLocalView(view:videoView)

        return container
    }

    @objc func setParticipantSID(participantSID: NSString) {
        let hdVideo = HDVideo()
        hdVideo.addParticipantView(view: self.videoView, sid: participantSID as String)
    }
}

