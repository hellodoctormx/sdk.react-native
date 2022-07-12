var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.default=HDVideoCall;var _slicedToArray2=_interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));var _react=_interopRequireDefault(require("react"));var _HDVideoCallView=_interopRequireDefault(require("./HDVideoCallView"));var _native=require("./native");var _connectionManager=require("../telecom/connectionManager");var _eventHandlers=require("../telecom/eventHandlers");var _video=_interopRequireDefault(require("../api/video"));var _jsxFileName="/Users/hellodoctor/workspace/mobile/sdk/react-native/js/components/HDVideoCall.js";function HDVideoCall(props){var _React$useState=_react.default.useState(props.videoRoomSID),_React$useState2=(0,_slicedToArray2.default)(_React$useState,2),videoRoomSID=_React$useState2[0],setVideoRoomSID=_React$useState2[1];var _React$useState3=_react.default.useState(props.consultationID),_React$useState4=(0,_slicedToArray2.default)(_React$useState3,2),consultationID=_React$useState4[0],setConsultationID=_React$useState4[1];var _React$useState5=_react.default.useState(props.accessToken),_React$useState6=(0,_slicedToArray2.default)(_React$useState5,2),accessToken=_React$useState6[0],setAccessToken=_React$useState6[1];_react.default.useEffect(function(){doBootstrapCall();},[]);_react.default.useEffect(function(){if(videoRoomSID&&!accessToken){doRequestAccessToken();}},[videoRoomSID]);function doBootstrapCall(){if(!videoRoomSID){var incomingCall=(0,_connectionManager.getIncomingCall)();if(!incomingCall){console.warn("[HDVideoCall:doBootstrapCall] no incoming call found");(0,_eventHandlers.navigateOnEndCall)();return;}setVideoRoomSID(incomingCall.videoRoomSID);setConsultationID(incomingCall.consultationID);}}function doRequestAccessToken(){_video.default.requestVideoCallAccess(videoRoomSID).then(function(_ref){var accessToken=_ref.accessToken;return setAccessToken(accessToken);}).catch(function(error){console.warn("[HDVideoCall:doRequestAccessToken] aborting call due to error:",error);(0,_eventHandlers.navigateOnEndCall)();});}return _react.default.createElement(_react.default.Fragment,{__self:this,__source:{fileName:_jsxFileName,lineNumber:50,columnNumber:9}},!accessToken&&_react.default.createElement(_native.LocalVideoView,{style:{width:"100%",height:"100%"},__self:this,__source:{fileName:_jsxFileName,lineNumber:51,columnNumber:30}}),accessToken&&_react.default.createElement(_HDVideoCallView.default,{videoRoomSID:videoRoomSID,consultationID:consultationID,accessToken:accessToken,__self:this,__source:{fileName:_jsxFileName,lineNumber:52,columnNumber:29}}));}