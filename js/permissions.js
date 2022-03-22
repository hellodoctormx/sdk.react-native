import {Platform, PermissionsAndroid} from "react-native";
import messaging from "@react-native-firebase/messaging";
import {subscribe} from "../notifications";
import {check, PERMISSIONS, request, RESULTS} from "react-native-permissions";
import {getCurrentUserRole} from "../utils/user";

export async function requestCloudMessagingPermissions() {
    if (getCurrentUserRole() === "anonymous") return;

    await messaging().registerDeviceForRemoteMessages().catch(console.info);

    const status = await messaging().hasPermission();

    if (status !== messaging.AuthorizationStatus.AUTHORIZED) {
        await messaging().requestPermission();
    }

    subscribe();
}

export async function requestLocationPermission() {
    const locationPermissionsIOS = [
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
    ];

    const locationPermissionsAndroid = [
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION
    ];

    const requiredPermissions = Platform.OS === "ios" ? locationPermissionsIOS : locationPermissionsAndroid;

    return checkPermissionsGranted(requiredPermissions);
}

export async function requestAudioPermission() {
    if (getCurrentUserRole() === "anonymous") return;

    const audioPermissionsIOS = [
        PERMISSIONS.IOS.MICROPHONE
    ];

    const audioPermissionsAndroid = [
        PERMISSIONS.ANDROID.RECORD_AUDIO,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
    ];

    const requiredPermissions = Platform.OS === "ios" ? audioPermissionsIOS : audioPermissionsAndroid;

    return checkPermissionsGranted(requiredPermissions);
}

export async function requestCameraPermissions() {
    if (getCurrentUserRole() === "anonymous") return;

    const cameraPermissionsIOS = [
        PERMISSIONS.IOS.CAMERA
    ];

    const cameraPermissionsAndroid = [
        PERMISSIONS.ANDROID.CAMERA,
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE
    ];

    const requiredPermissions = Platform.OS === "ios" ? cameraPermissionsIOS : cameraPermissionsAndroid;

    return checkPermissionsGranted(requiredPermissions);
}

export async function checkVideoCallPermissions(shouldRequest) {
    let cameraPermissionGranted;
    let microphonePermissionGranted;

    if (Platform.OS === "ios") {
        cameraPermissionGranted = await checkPermissionGranted(PERMISSIONS.IOS.CAMERA, shouldRequest);
        microphonePermissionGranted = await checkPermissionGranted(PERMISSIONS.IOS.MICROPHONE, shouldRequest);
    } else {
        cameraPermissionGranted = await checkPermissionGranted(PERMISSIONS.ANDROID.CAMERA, shouldRequest);
        microphonePermissionGranted = await checkPermissionGranted(PERMISSIONS.ANDROID.RECORD_AUDIO, shouldRequest);
    }

    return cameraPermissionGranted && microphonePermissionGranted;
}

function checkPermissionsGranted(permissions) {
    const hasRequiredPermissionsPromises = permissions.map(checkPermissionGranted);

    return Promise.all(hasRequiredPermissionsPromises).then(results => results.every(r => r === true));
}

function checkPermissionGranted(permission, shouldRequest) {
    const handlePermissionResult = result => {
        console.debug(`[handlePermissionResult:${permission}]`, {result});
        switch (result) {
            case RESULTS.UNAVAILABLE:
                console.log("This feature is not available (on this device / in this context)");
                break;
            case RESULTS.DENIED:
                console.log("The permission has not been requested / is denied but requestable");
                return request(permission);
            case RESULTS.LIMITED:
                console.log("The permission is limited: some actions are possible");
                break;
            case RESULTS.GRANTED:
                return true;
            case RESULTS.BLOCKED:
                console.log("The permission is denied and not requestable anymore");
                break;
        }

        return false;
    }

    let permissionsFunc;

    if (Platform.OS === "android") {
        permissionsFunc = shouldRequest ? PermissionsAndroid.request : PermissionsAndroid.check;
    } else {
        permissionsFunc = shouldRequest ? request : check;
    }

    return permissionsFunc(permission)
        .then(handlePermissionResult)
        .catch(error => {
            console.warn(`[VideoConsultationScreen:checkPermissions:ERROR]`, error);
        });
}
