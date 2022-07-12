var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.default=void 0;var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var _inherits2=_interopRequireDefault(require("@babel/runtime/helpers/inherits"));var _possibleConstructorReturn2=_interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));var _getPrototypeOf2=_interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));var _http=_interopRequireDefault(require("./http"));function _createSuper(Derived){var hasNativeReflectConstruct=_isNativeReflectConstruct();return function _createSuperInternal(){var Super=(0,_getPrototypeOf2.default)(Derived),result;if(hasNativeReflectConstruct){var NewTarget=(0,_getPrototypeOf2.default)(this).constructor;result=Reflect.construct(Super,arguments,NewTarget);}else{result=Super.apply(this,arguments);}return(0,_possibleConstructorReturn2.default)(this,result);};}function _isNativeReflectConstruct(){if(typeof Reflect==="undefined"||!Reflect.construct)return false;if(Reflect.construct.sham)return false;if(typeof Proxy==="function")return true;try{Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){}));return true;}catch(e){return false;}}var SchedulingAPI=function(_Http){(0,_inherits2.default)(SchedulingAPI,_Http);var _super=_createSuper(SchedulingAPI);function SchedulingAPI(){(0,_classCallCheck2.default)(this,SchedulingAPI);return _super.apply(this,arguments);}(0,_createClass2.default)(SchedulingAPI,[{key:"getAvailability",value:function getAvailability(requestMode,specialty,fromTime,toTime){return this.get("/scheduling/availability?requestMode="+requestMode+"&specialty="+specialty+"&fromTime="+fromTime+"&toTime="+toTime);}},{key:"requestConsultation",value:function requestConsultation(requestMode,specialty,startTime,reason){return this.post("/scheduling/_request",{requestMode:requestMode,specialty:specialty,startTime:startTime,reason:reason});}}]);return SchedulingAPI;}(_http.default);var _default=new SchedulingAPI();exports.default=_default;