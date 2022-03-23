package com.hellodoctor.video;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

import javax.annotation.Nonnull;

public class HDVideoLocalViewManager extends SimpleViewManager<HDVideoLocalView> {
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
    protected HDVideoLocalView createViewInstance(@Nonnull ThemedReactContext reactContext) {
        HDVideoLocalView localView = new HDVideoLocalView(reactContext);

        HDVideo hdVideo = HDVideo.getInstance(mContext);
        hdVideo.setLocalView(localView);

        return localView;
    }
}
