package com.hellodoctormx.sdk.video.managers;

import android.annotation.SuppressLint;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.PowerManager;
import android.os.PowerManager.WakeLock;
import android.util.Log;

import com.hellodoctormx.sdk.BuildConfig;

public class ProximityManager {

    private static final String ERROR_PROXIMITY_SENSOR_NOT_SUPPORTED = "Proximity sensor is not supported.";
    private static final String ERROR_PROXIMITY_LOCK_NOT_SUPPORTED = "Proximity lock is not supported.";

    private SensorManager sensorManager;

    private Sensor proximitySensor;
    private SensorEventListener proximityListener;

    private WakeLock proximityWakeLock = null;
    private PowerManager powerManager;

    private static final String TAG = "ProximityManager";

    public ProximityManager(Context context) {
        powerManager = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);

        assert sensorManager != null;

        proximitySensor = sensorManager.getDefaultSensor(Sensor.TYPE_PROXIMITY);

        initProximityWakeLock();
    }

    @SuppressLint("InvalidWakeLockTag")
    public void initProximityWakeLock() {
        int proximityScreenOffWakeLock = PowerManager.PROXIMITY_SCREEN_OFF_WAKE_LOCK;

        boolean isSupported = powerManager.isWakeLockLevelSupported(proximityScreenOffWakeLock);

        if (isSupported) {
            proximityWakeLock = powerManager.newWakeLock(proximityScreenOffWakeLock, TAG);
            proximityWakeLock.setReferenceCounted(false);
        }
    }

    public void turnScreenOn() {
        if (proximityWakeLock == null) {
            if (BuildConfig.DEBUG) {
                Log.d(TAG, ERROR_PROXIMITY_LOCK_NOT_SUPPORTED);
            }
            return;
        }

        synchronized (proximityWakeLock) {
            if (proximityWakeLock.isHeld()) {
                if (BuildConfig.DEBUG) {
                    Log.d(TAG, "turnScreenOn()");
                }

                proximityWakeLock.release(PowerManager.RELEASE_FLAG_WAIT_FOR_NO_PROXIMITY);
            }
        }
    }

    @SuppressLint("WakelockTimeout")
    public void turnScreenOff() {
        if (proximityWakeLock == null) {
            if (BuildConfig.DEBUG) {
                Log.d(TAG, ERROR_PROXIMITY_LOCK_NOT_SUPPORTED);
            }
            return;
        }

        synchronized (proximityWakeLock) {
            if (!proximityWakeLock.isHeld()) {
                if (BuildConfig.DEBUG) {
                    Log.d(TAG, "turnScreenOff()");
                }

                proximityWakeLock.acquire();
            }
        }
    }

    public void initProximitySensorEventListener() {
        if (proximityListener != null) {
            return;
        }
        if (BuildConfig.DEBUG) {
            Log.d(TAG, "initProximitySensorEventListener()");
        }
        proximityListener = new SensorEventListener() {
            @Override
            public void onSensorChanged(SensorEvent sensorEvent) {
                if (sensorEvent.sensor.getType() == Sensor.TYPE_PROXIMITY) {
//                    boolean isNear = false;
//                    if (sensorEvent.values[0] < proximitySensor.getMaximumRange()) {
//                        isNear = true;
//                    }
//                    if (isNear) {
//                        turnScreenOff();
//                    } else {
//                        turnScreenOn();
//                    }
                }
            }

            @Override
            public void onAccuracyChanged(Sensor sensor, int accuracy) {
            }
        };
    }

    public void startProximitySensor() {
        if (proximitySensor == null) {
            Log.e(TAG, ERROR_PROXIMITY_SENSOR_NOT_SUPPORTED);
            return;
        }

        initProximitySensorEventListener();

        if (proximityListener != null) {
            if (BuildConfig.DEBUG) {
                Log.d(TAG, "register proximity listener");
            }
            // SensorManager.SENSOR_DELAY_FASTEST(0 ms),
            // SensorManager.SENSOR_DELAY_GAME(20 ms),
            // SensorManager.SENSOR_DELAY_UI(60 ms),
            // SensorManager.SENSOR_DELAY_NORMAL(200 ms)
            sensorManager.registerListener(
                    proximityListener,
                    proximitySensor,
                    SensorManager.SENSOR_DELAY_NORMAL
            );
        }
    }

    public void stopProximitySensor() {
        if (proximitySensor == null) {
            Log.e(TAG, ERROR_PROXIMITY_SENSOR_NOT_SUPPORTED);
            return;
        }
        if (proximityListener != null) {
            if (BuildConfig.DEBUG) {
                Log.d(TAG, "unregister proximity listener");
            }
            sensorManager.unregisterListener(proximityListener);
            proximityListener = null;
        }
    }
}
