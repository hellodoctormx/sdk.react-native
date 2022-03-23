package com.hellodoctor.video;

import android.view.Gravity;
import android.widget.FrameLayout;

import com.facebook.react.uimanager.ThemedReactContext;
import com.twilio.video.VideoScaleType;
import com.twilio.video.VideoView;

public class HDVideoRemoteView extends VideoView {
    public HDVideoRemoteView(ThemedReactContext themedReactContext) {
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
