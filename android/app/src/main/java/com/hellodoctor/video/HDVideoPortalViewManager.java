package com.hellodoctor.video;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import javax.annotation.Nonnull;

public class HDVideoPortalViewManager extends SimpleViewManager<HDVideoPortalView> {
    private static final String REACT_CLASS = "HDVideoPortalView";

    private ReactApplicationContext mContext;

    HDVideoPortalViewManager(ReactApplicationContext context) {
        mContext = context;
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Nonnull
    @Override
    protected HDVideoPortalView createViewInstance(@Nonnull ThemedReactContext reactContext) {
        HDVideoPortalView portalView = new HDVideoPortalView(reactContext, mContext);

        com.hellodoctor.video.HDVideo hdVideo = com.hellodoctor.video.HDVideo.getInstance(mContext);
        hdVideo.setPortalView(portalView);

        return portalView;
    }

    @ReactProp(name = "participantSID")
    public void setParticipantSID(HDVideoRemoteView view, String participantSID) {
        com.hellodoctor.video.HDVideo hdVideo = com.hellodoctor.video.HDVideo.getInstance(mContext);
        hdVideo.setPortalParticipantIdentity(participantSID);
    }
}
