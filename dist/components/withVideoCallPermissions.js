var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.default=withVideoCallPermissions;var _extends2=_interopRequireDefault(require("@babel/runtime/helpers/extends"));var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var _slicedToArray2=_interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));var _react=_interopRequireDefault(require("react"));var _reactNative=require("react-native");var _permissions=require("../telecom/permissions");var _Ionicons=_interopRequireDefault(require("react-native-vector-icons/Ionicons"));var _HDLogo=_interopRequireDefault(require("./HDLogo"));var _jsxFileName="/Users/hellodoctor/workspace/mobile/sdk/react-native/js/components/withVideoCallPermissions.js";function withVideoCallPermissions(WrappedComponent){return function VideoCallPermissionsGate(props){var _React$useState=_react.default.useState(null),_React$useState2=(0,_slicedToArray2.default)(_React$useState,2),hasVideoCallPermissions=_React$useState2[0],setHasVideoCallPermissions=_React$useState2[1];var opacityRef=_react.default.useRef(new _reactNative.Animated.Value(0));var doShowGate=function doShowGate(){return _reactNative.Animated.timing(opacityRef.current,{toValue:1,duration:800,useNativeDriver:true}).start();};var checkPermissions=function(){var _ref=(0,_asyncToGenerator2.default)(function*(){var hasVideoCallPermissions=yield(0,_permissions.checkVideoCallPermissions)(true);setHasVideoCallPermissions(hasVideoCallPermissions);});return function checkPermissions(){return _ref.apply(this,arguments);};}();_react.default.useEffect(function(){checkPermissions().catch(function(error){return console.warn("[VideoCallPermissionsGate:checkPermissions] "+error);});},[]);_react.default.useEffect(function(){if(hasVideoCallPermissions===false){doShowGate();}},[hasVideoCallPermissions]);var goToSettings=function(){var _ref2=(0,_asyncToGenerator2.default)(function*(){_reactNative.Linking.openSettings().catch(console.warn);var checkListener=_reactNative.AppState.addEventListener("change",function(appState){if(appState==="active"){checkPermissions();checkListener.remove();}});});return function goToSettings(){return _ref2.apply(this,arguments);};}();var _Dimensions$get=_reactNative.Dimensions.get("screen"),screenHeight=_Dimensions$get.height;return _react.default.createElement(_react.default.Fragment,{__self:this,__source:{fileName:_jsxFileName,lineNumber:44,columnNumber:13}},hasVideoCallPermissions&&_react.default.createElement(WrappedComponent,(0,_extends2.default)({},props,{__self:this,__source:{fileName:_jsxFileName,lineNumber:45,columnNumber:45}})),hasVideoCallPermissions===null&&_react.default.createElement(_reactNative.View,{style:{height:screenHeight,backgroundColor:"black",padding:12},__self:this,__source:{fileName:_jsxFileName,lineNumber:46,columnNumber:54}}),!hasVideoCallPermissions&&_react.default.createElement(_reactNative.Animated.View,{isHidden:hasVideoCallPermissions,style:{flex:1,backgroundColor:"#0062B2",padding:12,opacity:opacityRef.current},__self:this,__source:{fileName:_jsxFileName,lineNumber:48,columnNumber:21}},_react.default.createElement(_HDLogo.default,{size:42,white:true,containerStyle:{alignItems:"center"},__self:this,__source:{fileName:_jsxFileName,lineNumber:49,columnNumber:25}}),_react.default.createElement(_reactNative.View,{style:{flex:1,marginTop:96},__self:this,__source:{fileName:_jsxFileName,lineNumber:50,columnNumber:25}},_react.default.createElement(_reactNative.View,{style:{alignItems:"center",marginBottom:48},__self:this,__source:{fileName:_jsxFileName,lineNumber:51,columnNumber:29}},_react.default.createElement(_Ionicons.default,{name:"videocam-outline",size:48,color:"white",style:{alignItems:"center"},__self:this,__source:{fileName:_jsxFileName,lineNumber:52,columnNumber:33}})),_react.default.createElement(_reactNative.Text,{style:{fontSize:26,color:"white"},__self:this,__source:{fileName:_jsxFileName,lineNumber:54,columnNumber:29}},"Permisos faltantes"),_react.default.createElement(_reactNative.Text,{style:{fontSize:20,color:"white"},__self:this,__source:{fileName:_jsxFileName,lineNumber:57,columnNumber:29}},"Necesitamos permisos para acceder a su ",_react.default.createElement(_reactNative.Text,{__self:this,__source:{fileName:_jsxFileName,lineNumber:58,columnNumber:72}},"c\xE1mara y micr\xF3fono")," para iniciar la llamada. Haga clic a continuaci\xF3n para actualizar su configuraci\xF3n."),_react.default.createElement(_reactNative.TouchableOpacity,{onPress:goToSettings,color:"#00294b",style:{justifyContent:"center"},__self:this,__source:{fileName:_jsxFileName,lineNumber:60,columnNumber:29}},_react.default.createElement(_reactNative.Text,{style:{fontSize:18,color:"white",textAlign:"center"},__self:this,__source:{fileName:_jsxFileName,lineNumber:61,columnNumber:33}},"Ajustes"),_react.default.createElement(_Ionicons.default,{name:"chevron-forward-outline",size:20,color:"white",style:{position:"absolute",right:0,paddingRight:12},__self:this,__source:{fileName:_jsxFileName,lineNumber:64,columnNumber:33}})))));};}