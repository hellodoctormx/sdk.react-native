var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.default=HDTouchableButton;var _react=_interopRequireDefault(require("react"));var _reactNative=require("react-native");var _colors=require("../utils/colors");var _lodash=_interopRequireDefault(require("lodash"));var _FontAwesome=_interopRequireDefault(require("react-native-vector-icons/FontAwesome5"));var _jsxFileName="/Users/hellodoctor/workspace/mobile/sdk/react-native/js/components/HDTouchableButton.js";function HDTouchableButton(props){var _props$textStyle,_this=this;if(props.isHidden)return null;var hasLeftIcon=!_lodash.default.isEmpty(props.icon);var hasRightIcon=!_lodash.default.isEmpty(props.iconRight);var textAlign=hasLeftIcon?"left":hasRightIcon?"right":"center";var paddingRight=hasLeftIcon?24:18;var paddingLeft=hasRightIcon?24:18;var justifyContent=hasLeftIcon?"center":hasRightIcon?"flex-end":"center";var fontSize=((_props$textStyle=props.textStyle)==null?void 0:_props$textStyle.fontSize)||18;var iconSize=props.iconSize||fontSize;var InnerText=function InnerText(){return _react.default.createElement(_reactNative.Text,{style:Object.assign({fontSize:fontSize,textAlign:textAlign,fontWeight:"bold",color:"white"},props.textStyle),__self:_this,__source:{fileName:_jsxFileName,lineNumber:20,columnNumber:29}},props.label);};var StringIcon=function StringIcon(props){return _react.default.createElement(_FontAwesome.default,{name:props.icon,size:iconSize,color:"white",__self:_this,__source:{fileName:_jsxFileName,lineNumber:21,columnNumber:33}});};var InnerTextMemo=_react.default.memo(InnerText);var StringIconMemo=_react.default.memo(StringIcon);return _react.default.createElement(_reactNative.TouchableOpacity,{testID:props.testID,onPress:props.onPress,disabled:props.disabled||props.loading,style:Object.assign({flexDirection:"row",alignItems:"center",justifyContent:justifyContent,padding:9,paddingLeft:paddingLeft,paddingRight:paddingRight,marginTop:6,marginBottom:6,borderRadius:6,backgroundColor:props.color,opacity:props.disabled?0.3:1,shadowColor:props.shadowColor||_colors.hdColors.secondaryDarkest,shadowOpacity:0.1,shadowRadius:2,shadowOffset:{height:2,width:2}},props.style),__self:this,__source:{fileName:_jsxFileName,lineNumber:27,columnNumber:9}},props.icon&&_react.default.createElement(_reactNative.View,{style:{marginRight:12},__self:this,__source:{fileName:_jsxFileName,lineNumber:50,columnNumber:17}},_lodash.default.isString(props.icon)&&_react.default.createElement(StringIconMemo,{icon:props.icon,__self:this,__source:{fileName:_jsxFileName,lineNumber:51,columnNumber:48}}),_lodash.default.isObject(props.icon)&&props.icon),props.label&&_react.default.createElement(InnerTextMemo,{__self:this,__source:{fileName:_jsxFileName,lineNumber:55,columnNumber:29}}),props.iconRight&&_react.default.createElement(_reactNative.View,{style:{marginLeft:12},__self:this,__source:{fileName:_jsxFileName,lineNumber:57,columnNumber:17}},_lodash.default.isString(props.iconRight)&&_react.default.createElement(StringIconMemo,{icon:props.iconRight,__self:this,__source:{fileName:_jsxFileName,lineNumber:58,columnNumber:53}}),_lodash.default.isObject(props.iconRight)&&props.iconRight),props.children,props.isLoading&&_react.default.createElement(_react.default.Fragment,{__self:this,__source:{fileName:_jsxFileName,lineNumber:64,columnNumber:17}},_react.default.createElement(_reactNative.View,{style:{position:"absolute",left:0,right:0,top:0,bottom:0,backgroundColor:"white",opacity:0.8},__self:this,__source:{fileName:_jsxFileName,lineNumber:65,columnNumber:21}}),_react.default.createElement(_reactNative.View,{style:{position:"absolute",left:0,right:0,top:0,bottom:0,justifyContent:"center",alignItems:"flex-start"},__self:this,__source:{fileName:_jsxFileName,lineNumber:74,columnNumber:21}},_react.default.createElement(_reactNative.ActivityIndicator,{animating:props.loading,size:"small",color:_colors.hdColors.secondaryDark,__self:this,__source:{fileName:_jsxFileName,lineNumber:75,columnNumber:25}}))));}