package com.hellodoctormx.sdk;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.hellodoctormx.sdk.video.LocalParticipantView;
import com.hellodoctormx.sdk.video.VideoCallController;

import javax.annotation.Nonnull;

public class RNHDVideoLocalViewManager extends SimpleViewManager<LocalParticipantView> {
    private static final String REACT_CLASS = "HDVideoLocalView";

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Nonnull
    @Override
    protected LocalParticipantView createViewInstance(@Nonnull ThemedReactContext reactContext) {
        LocalParticipantView localView = new LocalParticipantView(reactContext);

        VideoCallController videoCallController = VideoCallController.Companion.getInstance(reactContext);
        videoCallController.setLocalParticipantView(localView);

        return localView;
    }
}
