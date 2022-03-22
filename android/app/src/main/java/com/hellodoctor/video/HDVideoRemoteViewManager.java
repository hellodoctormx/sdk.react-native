package com.hellodoctor.video;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import javax.annotation.Nonnull;

public class HDVideoRemoteViewManager extends SimpleViewManager<com.hellodoctor.video.HDVideoRemoteView> {
    private static final String REACT_CLASS = "HDVideoRemoteView";

    private ReactApplicationContext mContext;

    HDVideoRemoteViewManager(ReactApplicationContext context) {
        mContext = context;
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Nonnull
    @Override
    protected com.hellodoctor.video.HDVideoRemoteView createViewInstance(@Nonnull ThemedReactContext reactContext) {
        return new com.hellodoctor.video.HDVideoRemoteView(reactContext, mContext);
    }

    @ReactProp(name = "participantSID")
    public void setParticipantSID(com.hellodoctor.video.HDVideoRemoteView view, String participantSID) {
        com.hellodoctor.video.HDVideo hdVideo = com.hellodoctor.video.HDVideo.getInstance(mContext);
        hdVideo.setRemoteParticipantVideoView(view, participantSID);
    }
}
