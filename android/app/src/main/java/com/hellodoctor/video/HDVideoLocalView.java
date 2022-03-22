package com.hellodoctor.video;

import android.view.Gravity;
import android.widget.FrameLayout;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ThemedReactContext;
import com.twilio.video.VideoScaleType;
import com.twilio.video.VideoTextureView;

public class HDVideoLocalView extends VideoTextureView {
    private static final String TAG = "HDVideoLocalView";
    private final ReactApplicationContext mReactContext;

    public HDVideoLocalView(ThemedReactContext themedReactContext, ReactApplicationContext reactContext) {
        super(themedReactContext);

        mReactContext = reactContext;

        setMirror(true);
        setVideoScaleType(VideoScaleType.ASPECT_FIT);

        FrameLayout.LayoutParams aspectRatioParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT);
        aspectRatioParams.gravity = Gravity.CENTER;

        setLayoutParams(aspectRatioParams);
    }
}
