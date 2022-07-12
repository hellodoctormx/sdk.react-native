//
//  HDVideoLocalView.swift
//  RNHelloDoctor
//
//  Created by HelloDoctor on 3/31/22.
//

import Foundation
import TwilioVideo
import UIKit

@objc(HDVideoView)
class HDVideoView: UIView {
    let videoView: VideoView
    @objc var participantSID: NSString = ""

    init() {
        videoView = VideoView()
        videoView.autoresizingMask = [.flexibleHeight, .flexibleWidth]
        videoView.contentMode = .scaleAspectFill

        super.init(frame: .zero)

        self.addSubview(videoView)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func didSetProps(_ changedProps: [String]!) {
        HDVideo.instance.addParticipantView(view: self.videoView, sid: self.participantSID as String)
    }
}
