package com.hellodoctor.video;

import android.view.Gravity;
import android.widget.FrameLayout;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ThemedReactContext;
import com.twilio.video.VideoScaleType;
import com.twilio.video.VideoTextureView;

public class HDVideoPortalView extends VideoTextureView {
    private static final String TAG = "HDVideoPortalView";

    public HDVideoPortalView(ThemedReactContext themedReactContext, ReactApplicationContext reactContext) {
        super(themedReactContext);

        setMirror(true);
        setVideoScaleType(VideoScaleType.ASPECT_FIT);

        FrameLayout.LayoutParams aspectRatioParams = new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT);
        aspectRatioParams.gravity = Gravity.CENTER;

        setLayoutParams(aspectRatioParams);

//        setListener(new VideoRenderer.Listener() {
//            @Override
//            public void onFirstFrame() {
//                Log.d(TAG, "first frame rendered");
//            }
//
//            @Override
//            public void onFrameDimensionsChanged(int width, int height, int rotation) {
//                Log.d(TAG, "onFrameDimensionsChanged [" + width + "," + height + ":" + rotation + "]");
//                setLayoutParams(new FrameLayout.LayoutParams(width, height));
//                HDVideoPortalView.this.forceLayout();
//            }
//        });
    }
}
