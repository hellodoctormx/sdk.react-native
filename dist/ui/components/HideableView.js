var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.default=HideableView;var _extends2=_interopRequireDefault(require("@babel/runtime/helpers/extends"));var _slicedToArray2=_interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));var _react=_interopRequireWildcard(require("react"));var _reactNative=require("react-native");var _jsxFileName="/Users/hellodoctor/workspace/mobile/sdk/react-native/lib/ui/components/HideableView.tsx";function _getRequireWildcardCache(nodeInterop){if(typeof WeakMap!=="function")return null;var cacheBabelInterop=new WeakMap();var cacheNodeInterop=new WeakMap();return(_getRequireWildcardCache=function _getRequireWildcardCache(nodeInterop){return nodeInterop?cacheNodeInterop:cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj,nodeInterop){if(!nodeInterop&&obj&&obj.__esModule){return obj;}if(obj===null||typeof obj!=="object"&&typeof obj!=="function"){return{default:obj};}var cache=_getRequireWildcardCache(nodeInterop);if(cache&&cache.has(obj)){return cache.get(obj);}var newObj={};var hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj){if(key!=="default"&&Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;if(desc&&(desc.get||desc.set)){Object.defineProperty(newObj,key,desc);}else{newObj[key]=obj[key];}}}newObj.default=obj;if(cache){cache.set(obj,newObj);}return newObj;}function HideableView(props){var _useState=(0,_react.useState)(props.isHidden),_useState2=(0,_slicedToArray2.default)(_useState,2),isHidden=_useState2[0],setIsHidden=_useState2[1];var animatedOpacity=(0,_react.useRef)(new _reactNative.Animated.Value(0)).current;(0,_react.useEffect)(function(){if(props.isHidden){hideView();}else{showView();}},[props.isHidden]);var showView=function showView(){_reactNative.Animated.timing(animatedOpacity,{toValue:1,duration:300,useNativeDriver:false}).start(function(){setIsHidden(false);});};var hideView=function hideView(){return _reactNative.Animated.timing(animatedOpacity,{toValue:0,duration:300,useNativeDriver:false}).start(function(){return setIsHidden(true);});};return _react.default.createElement(_reactNative.Animated.View,(0,_extends2.default)({ref:props.forwardRef},props,{style:Object.assign({display:isHidden?'none':'flex',opacity:animatedOpacity},props.style),__self:this,__source:{fileName:_jsxFileName,lineNumber:26,columnNumber:9}}),props.children);}