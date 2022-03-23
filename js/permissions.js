import {PermissionsAndroid, Platform} from "react-native";
import {check, PERMISSIONS, request, RESULTS} from "react-native-permissions";

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
