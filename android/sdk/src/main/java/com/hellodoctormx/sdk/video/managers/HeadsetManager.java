package com.hellodoctormx.sdk.video.managers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.media.AudioManager;
import android.os.Bundle;
import android.util.Log;

import com.hellodoctormx.sdk.BuildConfig;

public class HeadsetManager {

    private static final String TAG = "HeadsetManager";

    private BroadcastReceiver wiredHeadsetReceiver;
    private static final String ACTION_HEADSET_PLUG = AudioManager.ACTION_HEADSET_PLUG;

    public void startWiredHeadsetEvent(Context context) {
        if (wiredHeadsetReceiver != null) {
            return;
        }
        if (context == null) {
            if (BuildConfig.DEBUG) {
                Log.d(TAG, "startWiredHeadsetEvent() reactContext is null");
            }
            return;
        }
        if (BuildConfig.DEBUG) {
            Log.d(TAG, "startWiredHeadsetEvent()");
        }
        wiredHeadsetReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (ACTION_HEADSET_PLUG.equals(intent.getAction())) {
                    String deviceName = intent.getStringExtra("name");
                    if (deviceName == null) {
                        deviceName = "";
                    }
                    Bundle data = new Bundle();
                    data.putBoolean("isPlugged", intent.getIntExtra("state", 0) == 1);
                    data.putBoolean("hasMic", intent.getIntExtra("microphone", 0) == 1);
                    data.putString("deviceName", deviceName);
//                    eventManager.sendEvent("wiredHeadset", data);
                }
            }
        };
        context.registerReceiver(wiredHeadsetReceiver, new IntentFilter(ACTION_HEADSET_PLUG));
    }

    public void stopWiredHeadsetEvent(Context context) {
        if (wiredHeadsetReceiver == null) {
            return;
        }
        if (context == null) {
            if (BuildConfig.DEBUG) {
                Log.d(TAG, "stopWiredHeadsetEvent() reactContext is null");
            }
            return;
        }
        if (BuildConfig.DEBUG) {
            Log.d(TAG, "stopWiredHeadsetEvent()");
        }
        context.unregisterReceiver(wiredHeadsetReceiver);
        wiredHeadsetReceiver = null;
    }
}