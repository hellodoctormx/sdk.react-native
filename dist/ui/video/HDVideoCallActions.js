var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.default=HDVideoCallActions;var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var _slicedToArray2=_interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));var _lodash=_interopRequireDefault(require("lodash"));var _react=_interopRequireWildcard(require("react"));var _reactNative=require("react-native");var _Ionicons=_interopRequireDefault(require("react-native-vector-icons/Ionicons"));var activeCallManager=_interopRequireWildcard(require("../../telecom/activeCallManager"));var _native=require("./native");var _theme=require("../theme");var _jsxFileName="/Users/hellodoctor/workspace/mobile/sdk/react-native/lib/ui/video/HDVideoCallActions.js",_this=this;function _getRequireWildcardCache(nodeInterop){if(typeof WeakMap!=="function")return null;var cacheBabelInterop=new WeakMap();var cacheNodeInterop=new WeakMap();return(_getRequireWildcardCache=function _getRequireWildcardCache(nodeInterop){return nodeInterop?cacheNodeInterop:cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj,nodeInterop){if(!nodeInterop&&obj&&obj.__esModule){return obj;}if(obj===null||typeof obj!=="object"&&typeof obj!=="function"){return{default:obj};}var cache=_getRequireWildcardCache(nodeInterop);if(cache&&cache.has(obj)){return cache.get(obj);}var newObj={};var hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj){if(key!=="default"&&Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;if(desc&&(desc.get||desc.set)){Object.defineProperty(newObj,key,desc);}else{newObj[key]=obj[key];}}}newObj.default=obj;if(cache){cache.set(obj,newObj);}return newObj;}function HDVideoCallActions(props){var _useState=(0,_react.useState)(false),_useState2=(0,_slicedToArray2.default)(_useState,2),areControlsHidden=_useState2[0],setAreControlsHidden=_useState2[1];var _useState3=(0,_react.useState)(true),_useState4=(0,_slicedToArray2.default)(_useState3,2),isLocalVideoEnabled=_useState4[0],setIsLocalVideoEnabled=_useState4[1];var _useState5=(0,_react.useState)(true),_useState6=(0,_slicedToArray2.default)(_useState5,2),isLocalAudioEnabled=_useState6[0],setIsLocalAudioEnabled=_useState6[1];var _useState7=(0,_react.useState)(false),_useState8=(0,_slicedToArray2.default)(_useState7,2),didRemoteParticipantDisconnect=_useState8[0],setDidRemoteParticipantDisconnect=_useState8[1];var _useState9=(0,_react.useState)('front'),_useState10=(0,_slicedToArray2.default)(_useState9,2),currentCameraDirection=_useState10[0],setCurrentCameraDirection=_useState10[1];var _useState11=(0,_react.useState)(props.videoCallStatus),_useState12=(0,_slicedToArray2.default)(_useState11,2),videoCallStatus=_useState12[0],setVideoCallStatus=_useState12[1];var toggleLocalVideoStateIconName=isLocalVideoEnabled?'videocam':'videocam-outline';var toggleLocalAudioStateIconName=isLocalAudioEnabled?'mic':'mic-off-outline';var automaticCloseHandleRef=(0,_react.useRef)(0);var controlsOpacity=(0,_react.useRef)(new _reactNative.Animated.Value(1)).current;(0,_react.useEffect)(function(){var connectedToRoomListener=_native.hdEventEmitter.addListener('connectedToRoom',function(event){var videoCallStatus=_lodash.default.isEmpty(event.participants)?'waiting':'in-progress';setVideoCallStatus(videoCallStatus);setTimeout(hideControls,6000);});var participantConnectionEventListener=_native.hdEventEmitter.addListener('participantRoomConnectionEvent',function(event){if(event.action==='connected'){setVideoCallStatus('in-progress');setDidRemoteParticipantDisconnect(false);}else if(event.action==='disconnected'){setVideoCallStatus('disconnected');setDidRemoteParticipantDisconnect(true);}});return function(){connectedToRoomListener.remove();participantConnectionEventListener.remove();};});function flipCameraDirection(){return _flipCameraDirection.apply(this,arguments);}function _flipCameraDirection(){_flipCameraDirection=(0,_asyncToGenerator2.default)(function*(){yield activeCallManager.flipCamera();setCurrentCameraDirection(currentCameraDirection==='back'?'front':'back');});return _flipCameraDirection.apply(this,arguments);}function toggleLocalVideoState(){activeCallManager.setLocalVideoEnabled(!isLocalVideoEnabled);setIsLocalVideoEnabled(!isLocalVideoEnabled);}function toggleLocalAudioState(){return _toggleLocalAudioState.apply(this,arguments);}function _toggleLocalAudioState(){_toggleLocalAudioState=(0,_asyncToGenerator2.default)(function*(){activeCallManager.setLocalAudioEnabled(!isLocalAudioEnabled);setIsLocalAudioEnabled(!isLocalAudioEnabled);});return _toggleLocalAudioState.apply(this,arguments);}function showControls(){clearTimeout(automaticCloseHandleRef.current);setAreControlsHidden(false);_reactNative.Animated.timing(controlsOpacity,{toValue:1,duration:300,useNativeDriver:false}).start();automaticCloseHandleRef.current=setTimeout(hideControls,4000);}function hideControls(){clearTimeout(automaticCloseHandleRef.current);setAreControlsHidden(true);_reactNative.Animated.timing(controlsOpacity,{toValue:0,duration:300,useNativeDriver:false}).start();}var toggleControls=function toggleControls(){if(areControlsHidden){showControls();}else{hideControls();}};var _Dimensions$get=_reactNative.Dimensions.get('screen'),screenHeight=_Dimensions$get.height,screenWidth=_Dimensions$get.width;return _react.default.createElement(_reactNative.TouchableWithoutFeedback,{onPress:toggleControls,style:{zIndex:2,elevation:3,position:'absolute'},__self:this,__source:{fileName:_jsxFileName,lineNumber:122,columnNumber:9}},_react.default.createElement(_reactNative.View,{style:{zIndex:100,width:screenWidth,height:screenHeight},__self:this,__source:{fileName:_jsxFileName,lineNumber:125,columnNumber:13}},_react.default.createElement(_reactNative.Animated.View,{style:{flex:1,opacity:controlsOpacity,justifyContent:'flex-end'},__self:this,__source:{fileName:_jsxFileName,lineNumber:127,columnNumber:17}},didRemoteParticipantDisconnect&&_react.default.createElement(_reactNative.View,{style:{marginBottom:48,padding:24,margin:12,backgroundColor:'#000000',opacity:0.6,borderRadius:48},__self:this,__source:{fileName:_jsxFileName,lineNumber:134,columnNumber:25}},_react.default.createElement(_reactNative.Text,{style:{fontSize:20,color:'white',textAlign:'center'},__self:this,__source:{fileName:_jsxFileName,lineNumber:143,columnNumber:29}},"Tu doctor se ha desconectado")),_react.default.createElement(_reactNative.View,{style:{padding:18,backgroundColor:(0,_theme.alpha)('#000000',0.8),borderRadius:64,margin:18},__self:this,__source:{fileName:_jsxFileName,lineNumber:153,columnNumber:21}},_react.default.createElement(_reactNative.View,{style:{flexDirection:'row',alignItems:'center',justifyContent:'space-around'},__self:this,__source:{fileName:_jsxFileName,lineNumber:160,columnNumber:25}},_react.default.createElement(ToggleAction,{onPress:props.onEndCall,disabled:areControlsHidden,size:64,color:'#C52723',icon:'call',iconStyle:{transform:[{rotate:'135deg'}]},__self:this,__source:{fileName:_jsxFileName,lineNumber:166,columnNumber:29}}),_react.default.createElement(ToggleAction,{onPress:toggleLocalVideoState,disabled:areControlsHidden,size:54,icon:toggleLocalVideoStateIconName,__self:this,__source:{fileName:_jsxFileName,lineNumber:174,columnNumber:29}}),_react.default.createElement(ToggleAction,{onPress:toggleLocalAudioState,disabled:areControlsHidden,size:54,icon:toggleLocalAudioStateIconName,__self:this,__source:{fileName:_jsxFileName,lineNumber:180,columnNumber:29}}),_react.default.createElement(ToggleAction,{onPress:flipCameraDirection,disabled:areControlsHidden,size:54,icon:'ios-camera-reverse',__self:this,__source:{fileName:_jsxFileName,lineNumber:186,columnNumber:29}}))),_react.default.createElement(_reactNative.Animated.View,{style:{height:_reactNative.Animated.multiply(controlsOpacity,64)},__self:this,__source:{fileName:_jsxFileName,lineNumber:194,columnNumber:21}}))));}var ToggleAction=function ToggleAction(props){return _react.default.createElement(_reactNative.View,{style:{margin:12},__self:_this,__source:{fileName:_jsxFileName,lineNumber:204,columnNumber:5}},_react.default.createElement(_reactNative.TouchableOpacity,{onPress:props.onPress,disabled:props.disabled,style:{height:props.size,width:props.size,borderRadius:props.size,alignItems:'center',justifyContent:'center'},__self:_this,__source:{fileName:_jsxFileName,lineNumber:205,columnNumber:9}},_react.default.createElement(_reactNative.View,{style:{position:'absolute',height:props.size,width:props.size,borderRadius:props.size,backgroundColor:props.color||(0,_theme.alpha)('#444444',0.9)},__self:_this,__source:{fileName:_jsxFileName,lineNumber:215,columnNumber:13}}),_react.default.createElement(_Ionicons.default,{name:props.icon,size:32,color:'white',style:props.iconStyle,solid:true,__self:_this,__source:{fileName:_jsxFileName,lineNumber:224,columnNumber:13}})));};