package com.hellodoctor.video.managers;

import static android.content.Context.ACTIVITY_SERVICE;

import android.app.ActivityManager;
import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.List;

public class EventManager {

    private ReactContext mContext;

    static final String EVENT_PROXIMITY = "proximity";
    static final String EVENT_WIRED_HEADSET = "wiredHeadset";

    public static final String EVENT_DEVICE_READY = "deviceReady";
    public static final String EVENT_DEVICE_NOT_READY = "deviceNotReady";
    public static final String EVENT_DEVICE_DID_RECEIVE_INCOMING_VOICE_CALL = "deviceDidReceiveIncomingVoiceCall";
    public static final String EVENT_CONNECTION_DID_DISCONNECT = "connectionDidDisconnect";
    public static final String EVENT_DEVICE_DID_RECEIVE_INCOMING_VIDEO_CALL = "deviceDidReceiveIncomingVideoCall";

    public static final String EVENT_CALL_STATUS = "voiceCallStatus";

    private static final String TAG = "EventManager";

    public EventManager(ReactContext context) {
        mContext = context;
    }

    public boolean canDispatchEvent() {
        int appImportance = getApplicationImportance();

        return appImportance == ActivityManager.RunningAppProcessInfo.IMPORTANCE_FOREGROUND;
    }

    public void sendEvent(String eventName, @Nullable WritableMap params) {
        Log.d(TAG, "sendEvent " + eventName + " params " + params);

        if (mContext.hasActiveCatalystInstance()) {
            mContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);
        } else {
            Log.d(TAG, "failed Catalyst instance not active");
        }
    }

    public int getApplicationImportance() {
        ActivityManager activityManager = (ActivityManager) mContext.getSystemService(ACTIVITY_SERVICE);
        if (activityManager == null) {
            return 0;
        }
        List<ActivityManager.RunningAppProcessInfo> processInfos = activityManager.getRunningAppProcesses();
        if (processInfos == null) {
            return 0;
        }

        for (ActivityManager.RunningAppProcessInfo processInfo : processInfos) {
            if (processInfo.processName.equals(mContext.getApplicationInfo().packageName)) {
                return processInfo.importance;
            }
        }
        return 0;
    }
}
