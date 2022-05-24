package com.hellodoctormx.rn.video;

import android.view.Gravity;
import android.widget.FrameLayout;

import com.facebook.react.uimanager.ThemedReactContext;
import com.twilio.video.VideoScaleType;
import com.twilio.video.VideoTextureView;

public class HDVideoLocalView extends VideoTextureView {
    public HDVideoLocalView(ThemedReactContext themedReactContext) {
        super(themedReactContext);

        setMirror(true);
        setVideoScaleType(VideoScaleType.ASPECT_FIT);

        FrameLayout.LayoutParams aspectRatioParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT);
        aspectRatioParams.gravity = Gravity.CENTER;

        setLayoutParams(aspectRatioParams);
    }
}
