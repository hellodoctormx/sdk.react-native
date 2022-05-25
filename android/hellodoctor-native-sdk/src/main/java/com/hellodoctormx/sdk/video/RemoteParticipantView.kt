package com.hellodoctormx.sdk.video

import android.content.Context
import android.view.Gravity
import android.widget.FrameLayout
import com.twilio.video.VideoScaleType
import com.twilio.video.VideoView

class RemoteParticipantView(context: Context) : VideoView(context) {
    init {
        mirror = true
        videoScaleType = VideoScaleType.ASPECT_FIT

        val aspectRatioParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        )

        aspectRatioParams.gravity = Gravity.CENTER

        layoutParams = aspectRatioParams
    }
}
