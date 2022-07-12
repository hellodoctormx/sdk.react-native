var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.checkVideoCallPermissions=checkVideoCallPermissions;var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var _reactNative=require("react-native");var _reactNativePermissions=require("react-native-permissions");function checkVideoCallPermissions(_x){return _checkVideoCallPermissions.apply(this,arguments);}function _checkVideoCallPermissions(){_checkVideoCallPermissions=(0,_asyncToGenerator2.default)(function*(shouldRequest){var cameraPermissionGranted;var microphonePermissionGranted;if(_reactNative.Platform.OS==="ios"){cameraPermissionGranted=yield checkPermissionGranted(_reactNativePermissions.PERMISSIONS.IOS.CAMERA,shouldRequest);microphonePermissionGranted=yield checkPermissionGranted(_reactNativePermissions.PERMISSIONS.IOS.MICROPHONE,shouldRequest);}else{cameraPermissionGranted=yield checkPermissionGranted(_reactNativePermissions.PERMISSIONS.ANDROID.CAMERA,shouldRequest);microphonePermissionGranted=yield checkPermissionGranted(_reactNativePermissions.PERMISSIONS.ANDROID.RECORD_AUDIO,shouldRequest);}return cameraPermissionGranted&&microphonePermissionGranted;});return _checkVideoCallPermissions.apply(this,arguments);}function checkPermissionGranted(permission,shouldRequest){var handlePermissionResult=function handlePermissionResult(result){switch(result){case _reactNativePermissions.RESULTS.UNAVAILABLE:console.log("This feature is not available (on this device / in this context)");break;case _reactNativePermissions.RESULTS.DENIED:console.log("The permission has not been requested / is denied but requestable");return(0,_reactNativePermissions.request)(permission);case _reactNativePermissions.RESULTS.LIMITED:console.log("The permission is limited: some actions are possible");break;case _reactNativePermissions.RESULTS.GRANTED:return true;case _reactNativePermissions.RESULTS.BLOCKED:console.log("The permission is denied and not requestable anymore");break;}return false;};var permissionsFunc;if(_reactNative.Platform.OS==="android"){permissionsFunc=shouldRequest?_reactNative.PermissionsAndroid.request:_reactNative.PermissionsAndroid.check;}else{permissionsFunc=shouldRequest?_reactNativePermissions.request:_reactNativePermissions.check;}return permissionsFunc(permission).then(handlePermissionResult).catch(function(error){console.warn("[VideoConsultationScreen:checkPermissions:ERROR]",error);});}