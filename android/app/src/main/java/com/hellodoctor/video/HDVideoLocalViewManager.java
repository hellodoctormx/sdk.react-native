package com.hellodoctor.video;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

import javax.annotation.Nonnull;

public class HDVideoLocalViewManager extends SimpleViewManager<com.hellodoctor.video.HDVideoLocalView> {
    private static final String REACT_CLASS = "HDVideoLocalView";

    private ReactApplicationContext mContext;

    HDVideoLocalViewManager(ReactApplicationContext context) {
        mContext = context;
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Nonnull
    @Override
    protected com.hellodoctor.video.HDVideoLocalView createViewInstance(@Nonnull ThemedReactContext reactContext) {
        com.hellodoctor.video.HDVideoLocalView localView = new com.hellodoctor.video.HDVideoLocalView(reactContext, mContext);

        com.hellodoctor.video.HDVideo hdVideo = com.hellodoctor.video.HDVideo.getInstance(mContext);
        hdVideo.setLocalView(localView);

        return localView;
    }
}
