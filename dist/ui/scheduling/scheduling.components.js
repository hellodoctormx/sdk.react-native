var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports,"__esModule",{value:true});exports.ScheduledStartSelection=ScheduledStartSelection;exports.SchedulingSection=SchedulingSection;exports.SelectableAvailability=SelectableAvailability;var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var _slicedToArray2=_interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));var _lodash=_interopRequireDefault(require("lodash"));var _moment=_interopRequireDefault(require("moment"));var _react=_interopRequireWildcard(require("react"));var _reactNative=require("react-native");var _reactNativeCalendarPicker=_interopRequireDefault(require("react-native-calendar-picker"));var _types=require("../../types");var _theme=require("../theme");var _Button=_interopRequireDefault(require("../components/Button"));var _CollapsibleView=_interopRequireDefault(require("../components/CollapsibleView"));var _HideableView=_interopRequireDefault(require("../components/HideableView"));var _specialties=require("../components/icons/specialties.icons");var _Modal=_interopRequireDefault(require("../components/Modal"));var _TextInput=_interopRequireDefault(require("../components/TextInput"));var service=_interopRequireWildcard(require("../../services/scheduling.service"));var _scheduling2=require("./scheduling.context");var _jsxFileName="/Users/hellodoctor/workspace/mobile/sdk/react-native/lib/ui/scheduling/scheduling.components.tsx";function _getRequireWildcardCache(nodeInterop){if(typeof WeakMap!=="function")return null;var cacheBabelInterop=new WeakMap();var cacheNodeInterop=new WeakMap();return(_getRequireWildcardCache=function _getRequireWildcardCache(nodeInterop){return nodeInterop?cacheNodeInterop:cacheBabelInterop;})(nodeInterop);}function _interopRequireWildcard(obj,nodeInterop){if(!nodeInterop&&obj&&obj.__esModule){return obj;}if(obj===null||typeof obj!=="object"&&typeof obj!=="function"){return{default:obj};}var cache=_getRequireWildcardCache(nodeInterop);if(cache&&cache.has(obj)){return cache.get(obj);}var newObj={};var hasPropertyDescriptor=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var key in obj){if(key!=="default"&&Object.prototype.hasOwnProperty.call(obj,key)){var desc=hasPropertyDescriptor?Object.getOwnPropertyDescriptor(obj,key):null;if(desc&&(desc.get||desc.set)){Object.defineProperty(newObj,key,desc);}else{newObj[key]=obj[key];}}}newObj.default=obj;if(cache){cache.set(obj,newObj);}return newObj;}function SchedulingSection(props){var _useSchedulingContext=(0,_scheduling2.useSchedulingContext)(),consultationSpecialty=_useSchedulingContext.consultationSpecialty,consultationType=_useSchedulingContext.consultationType,setConsultationType=_useSchedulingContext.setConsultationType,scheduledStart=_useSchedulingContext.scheduledStart,consultationReason=_useSchedulingContext.consultationReason,isRequestReady=_useSchedulingContext.isRequestReady;var _useState=(0,_react.useState)(false),_useState2=(0,_slicedToArray2.default)(_useState,2),isRequestingConsultation=_useState2[0],setIsRequestingConsultation=_useState2[1];(0,_react.useEffect)(function(){if(!props.chatEnabled&&consultationType===undefined){setConsultationType(_types.ConsultationType.VIDEO);}},[props.chatEnabled,consultationType]);function requestConsultation(){if(!isRequestReady){return;}setIsRequestingConsultation(true);service.requestConsultation('callCenter',consultationSpecialty,scheduledStart,consultationReason).then(props.onRequestConsultationSuccess).catch(props.onRequestConsultationError).finally(function(){return setIsRequestingConsultation(false);});}function cancelScheduling(){props.onCancel();}return _react.default.createElement(_reactNative.View,{__self:this,__source:{fileName:_jsxFileName,lineNumber:84,columnNumber:9}},_react.default.createElement(SpecialtySelection,{__self:this,__source:{fileName:_jsxFileName,lineNumber:85,columnNumber:13}}),props.chatEnabled&&_react.default.createElement(ConsultationTypeSelection,{__self:this,__source:{fileName:_jsxFileName,lineNumber:86,columnNumber:35}}),_react.default.createElement(ScheduledStartSelection,{__self:this,__source:{fileName:_jsxFileName,lineNumber:87,columnNumber:13}}),_react.default.createElement(_Button.default,{label:'Agendar',color:_theme.ThemeColors.GoodAction,onPress:requestConsultation,disabled:!isRequestReady,loading:isRequestingConsultation,__self:this,__source:{fileName:_jsxFileName,lineNumber:89,columnNumber:13}}),_react.default.createElement(_reactNative.TouchableOpacity,{onPress:cancelScheduling,style:{alignSelf:'center'},disabled:isRequestingConsultation,__self:this,__source:{fileName:_jsxFileName,lineNumber:96,columnNumber:13}},_react.default.createElement(_reactNative.Text,{style:{fontFamily:_theme.HelloDoctorFonts.TextBold,fontSize:17,color:_theme.HelloDoctorColors.Red500,textAlign:'center',marginTop:12},__self:this,__source:{fileName:_jsxFileName,lineNumber:100,columnNumber:17}},"Cancelar")));}var CONSULTATION_SPECIALTY_OPTIONS=[{id:'Médico General',display:'Médico General'},{id:'Fisioterapia',display:'Fisioterapeuta'},{id:'Psicología',display:'Psicólogo'},{id:'Nutrición',display:'Nutriólogo'},{id:'Medicina Veterinaria',display:'Veterinario'}];function SpecialtySelection(){var _this=this;return _react.default.createElement(_reactNative.View,{__self:this,__source:{fileName:_jsxFileName,lineNumber:125,columnNumber:9}},CONSULTATION_SPECIALTY_OPTIONS.map(function(option){return _react.default.createElement(CallCenterSpecialtyOption,{key:option.id,option:option,disabled:false,__self:_this,__source:{fileName:_jsxFileName,lineNumber:127,columnNumber:17}});}));}function CallCenterSpecialtyOption(props){var _useSchedulingContext2=(0,_scheduling2.useSchedulingContext)(),consultationSpecialty=_useSchedulingContext2.consultationSpecialty,setConsultationSpecialty=_useSchedulingContext2.setConsultationSpecialty;var isSelectedOption=consultationSpecialty===props.option.id;function doToggleOption(){setConsultationSpecialty(isSelectedOption?undefined:props.option.id);}return _react.default.createElement(_HideableView.default,{isHidden:consultationSpecialty!==undefined&&!isSelectedOption,style:{marginBottom:6},__self:this,__source:{fileName:_jsxFileName,lineNumber:153,columnNumber:9}},_react.default.createElement(_reactNative.TouchableOpacity,{onPress:doToggleOption,disabled:props.disabled,style:{padding:12,paddingTop:12,paddingBottom:12,borderRadius:6,backgroundColor:'white',borderWidth:isSelectedOption?1:0,borderColor:_theme.HelloDoctorColors.Green500},__self:this,__source:{fileName:_jsxFileName,lineNumber:156,columnNumber:13}},_react.default.createElement(_reactNative.View,{style:{flexDirection:'row',alignItems:'center'},__self:this,__source:{fileName:_jsxFileName,lineNumber:168,columnNumber:17}},_react.default.createElement(_HideableView.default,{isHidden:isSelectedOption,horizontal:true,style:{width:48,alignItems:'center',marginRight:12},__self:this,__source:{fileName:_jsxFileName,lineNumber:169,columnNumber:21}},_react.default.createElement(_specialties.SpecialtyIcon,{size:42,specialty:props.option,__self:this,__source:{fileName:_jsxFileName,lineNumber:177,columnNumber:25}})),_react.default.createElement(_reactNative.Text,{style:{flex:1,fontFamily:_theme.HelloDoctorFonts.TextSemiBold,fontSize:22,color:_theme.HelloDoctorColors.Blue700},__self:this,__source:{fileName:_jsxFileName,lineNumber:179,columnNumber:21}},props.option.display),_react.default.createElement(_HideableView.default,{isHidden:!props.disabled,__self:this,__source:{fileName:_jsxFileName,lineNumber:188,columnNumber:21}},_react.default.createElement(_reactNative.Text,{style:{fontFamily:_theme.HelloDoctorFonts.TextRegular,fontSize:15,color:_theme.HelloDoctorColors.Red500},__self:this,__source:{fileName:_jsxFileName,lineNumber:189,columnNumber:25}},"Disponible pronto"))),_react.default.createElement(_CollapsibleView.default,{isCollapsed:!isSelectedOption,style:{alignItems:'flex-end'},__self:this,__source:{fileName:_jsxFileName,lineNumber:199,columnNumber:17}},_react.default.createElement(_reactNative.TouchableOpacity,{onPress:doToggleOption,style:{borderWidth:1,borderColor:(0,_theme.alpha)(_theme.HelloDoctorColors.Red500,0.3),borderRadius:6,paddingLeft:12,paddingRight:12,padding:3,marginTop:6,backgroundColor:'white'},__self:this,__source:{fileName:_jsxFileName,lineNumber:202,columnNumber:21}},_react.default.createElement(_reactNative.Text,{style:{fontFamily:_theme.HelloDoctorFonts.TextSemiBold,fontSize:13,color:_theme.HelloDoctorColors.Red300},__self:this,__source:{fileName:_jsxFileName,lineNumber:214,columnNumber:25}},"Cambiar")))));}function ConsultationTypeSelection(){var _this2=this;var _useSchedulingContext3=(0,_scheduling2.useSchedulingContext)(),consultationType=_useSchedulingContext3.consultationType,setConsultationType=_useSchedulingContext3.setConsultationType;return _react.default.createElement(_reactNative.View,{__self:this,__source:{fileName:_jsxFileName,lineNumber:233,columnNumber:9}},Object.values(_types.ConsultationType).map(function(option){var isSelectedOption=consultationType===option;function toggleOption(){setConsultationType(isSelectedOption?undefined:option);}return consultationType!==undefined&&!isSelectedOption?null:_react.default.createElement(_reactNative.TouchableOpacity,{key:option,onPress:toggleOption,style:{margin:6,padding:9,borderColor:_theme.ThemeColors.GoodAction,borderWidth:isSelectedOption?1:0,borderRadius:6},__self:_this2,__source:{fileName:_jsxFileName,lineNumber:242,columnNumber:21}},_react.default.createElement(_reactNative.Text,{style:{fontFamily:_theme.HelloDoctorFonts.TextBold,fontSize:16,color:_theme.ThemeColors.TextMain},__self:_this2,__source:{fileName:_jsxFileName,lineNumber:252,columnNumber:25}},option));}));}function getMonthRange(forDate){var monthStart=new Date(forDate);monthStart.setDate(1);var monthEnd=new Date(forDate);monthEnd.setMonth(monthEnd.getMonth()+1);monthEnd.setDate(-1);return{start:monthStart,end:monthEnd};}function ScheduledStartSelection(){var _this3=this;var _useSchedulingContext4=(0,_scheduling2.useSchedulingContext)(),consultationSpecialty=_useSchedulingContext4.consultationSpecialty,scheduledStart=_useSchedulingContext4.scheduledStart,setScheduledStart=_useSchedulingContext4.setScheduledStart;var _useState3=(0,_react.useState)(scheduledStart),_useState4=(0,_slicedToArray2.default)(_useState3,2),selectedDate=_useState4[0],setSelectedDate=_useState4[1];var _useState5=(0,_react.useState)(getMonthRange(new Date())),_useState6=(0,_slicedToArray2.default)(_useState5,2),currentMonthRange=_useState6[0],setCurrentMonthRange=_useState6[1];var _useState7=(0,_react.useState)([]),_useState8=(0,_slicedToArray2.default)(_useState7,2),availableTimes=_useState8[0],setAvailableTimes=_useState8[1];var _useState9=(0,_react.useState)([]),_useState10=(0,_slicedToArray2.default)(_useState9,2),disabledDates=_useState10[0],setDisabledDates=_useState10[1];var _useState11=(0,_react.useState)(false),_useState12=(0,_slicedToArray2.default)(_useState11,2),isLoadingAvailability=_useState12[0],setIsLoadingAvailability=_useState12[1];var _useState13=(0,_react.useState)(true),_useState14=(0,_slicedToArray2.default)(_useState13,2),showCalendarPicker=_useState14[0],setShowCalendarPicker=_useState14[1];var _useState15=(0,_react.useState)(true),_useState16=(0,_slicedToArray2.default)(_useState15,2),showScheduledStart=_useState16[0],setShowScheduledStart=_useState16[1];(0,_react.useEffect)(function(){getCurrentMonthAvailableTimes().catch(function(error){return console.error('[ScheduledStartSelection:useEffect:doGetCurrentMonthAvailableTimes]',error);});},[currentMonthRange.start,consultationSpecialty]);(0,_react.useEffect)(function(){var currentMonthEndDate=currentMonthRange.end.getDate();var newDisabledDates=_lodash.default.range(1,currentMonthEndDate+1).filter(function(date){return!availableTimes.some(function(time){return time.start.getDate()===date;});}).map(function(disabledDate){var disabled=new Date(currentMonthRange.start);disabled.setDate(disabledDate);return disabled;});setDisabledDates(newDisabledDates);},[availableTimes]);(0,_react.useEffect)(function(){if(scheduledStart){setSelectedDate(undefined);}},[scheduledStart]);function getCurrentMonthAvailableTimes(){return _getCurrentMonthAvailableTimes.apply(this,arguments);}function _getCurrentMonthAvailableTimes(){_getCurrentMonthAvailableTimes=(0,_asyncToGenerator2.default)(function*(){if(consultationSpecialty===undefined||currentMonthRange.start===undefined){return;}setIsLoadingAvailability(true);try{var newAvailableTimes=yield service.getAvailability('callCenter',consultationSpecialty,currentMonthRange.start,currentMonthRange.end);setAvailableTimes(newAvailableTimes);}catch(error){console.error('[ScheduledStartSelection:getCurrentMonthAvailableTimes]',error);}finally{setIsLoadingAvailability(false);}});return _getCurrentMonthAvailableTimes.apply(this,arguments);}var selectedDateAvailableTimes=selectedDate===undefined?[]:availableTimes.filter(function(time){return time.start.getDate()===selectedDate.getDate();});var isCollapsed=consultationSpecialty===undefined;(0,_react.useEffect)(function(){setShowCalendarPicker(selectedDate===undefined&&scheduledStart===undefined);setShowScheduledStart(scheduledStart!==undefined);},[selectedDate,scheduledStart]);var formattedPreviousMonth=(0,_moment.default)(currentMonthRange.start).subtract(1,'months').format('MMMM');var formattedNextMonth=(0,_moment.default)(currentMonthRange.start).add(1,'months').format('MMMM');return _react.default.createElement(_CollapsibleView.default,{isCollapsed:isCollapsed,__self:this,__source:{fileName:_jsxFileName,lineNumber:381,columnNumber:9}},_react.default.createElement(_CollapsibleView.default,{isCollapsed:!showCalendarPicker,__self:this,__source:{fileName:_jsxFileName,lineNumber:382,columnNumber:13}},_react.default.createElement(_reactNative.View,{style:{borderWidth:1,borderColor:_theme.HelloDoctorColors.Blue100,borderRadius:6,backgroundColor:'white'},__self:this,__source:{fileName:_jsxFileName,lineNumber:383,columnNumber:17}},_react.default.createElement(_reactNativeCalendarPicker.default,{selectedStartDate:selectedDate,onDateChange:function onDateChange(newSelectedDate){return setSelectedDate((0,_moment.default)(newSelectedDate).toDate());},onMonthChange:function onMonthChange(monthStart){return setCurrentMonthRange(getMonthRange(monthStart.toDate()));},todayBackgroundColor:'white',selectedDayColor:'white',months:['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],weekdays:_lodash.default.range(7).map(function(day){return(0,_moment.default)().isoWeekday(day).format('ddd');}),previousTitle:formattedPreviousMonth,previousTitleStyle:{color:_theme.HelloDoctorColors.Blue300,fontSize:16,fontFamily:_theme.HelloDoctorFonts.TextTitle},nextTitle:formattedNextMonth,nextTitleStyle:{color:_theme.HelloDoctorColors.Blue300,fontSize:16,fontFamily:_theme.HelloDoctorFonts.TextTitle},minDate:new Date(),textStyle:{fontFamily:_theme.HelloDoctorFonts.TextSemiBold},restrictMonthNavigation:true,disabledDates:disabledDates,scrollable:false,__self:this,__source:{fileName:_jsxFileName,lineNumber:390,columnNumber:21}}))),_react.default.createElement(_CollapsibleView.default,{isCollapsed:!showScheduledStart,__self:this,__source:{fileName:_jsxFileName,lineNumber:437,columnNumber:13}},_react.default.createElement(_reactNative.TouchableOpacity,{onPress:function onPress(){return setScheduledStart(undefined);},style:{padding:6,borderWidth:1,borderRadius:6,borderColor:_theme.HelloDoctorColors.Green500,backgroundColor:'#FFFFFF'},__self:this,__source:{fileName:_jsxFileName,lineNumber:438,columnNumber:17}},_react.default.createElement(_reactNative.Text,{style:{fontFamily:_theme.HelloDoctorFonts.TextRegular,fontSize:13,color:_theme.ThemeColors.TextSecondary},__self:this,__source:{fileName:_jsxFileName,lineNumber:447,columnNumber:21}},"Hora de la consulta"),_react.default.createElement(_reactNative.View,{style:{flexDirection:'row',alignItems:'center'},__self:this,__source:{fileName:_jsxFileName,lineNumber:455,columnNumber:21}},_react.default.createElement(_reactNative.Text,{style:{flex:1,fontFamily:_theme.HelloDoctorFonts.TextSemiBold,fontSize:18,color:_theme.HelloDoctorColors.Blue700},__self:this,__source:{fileName:_jsxFileName,lineNumber:456,columnNumber:25}},(0,_moment.default)(scheduledStart).format('DD MMMM [a las] HH:mm')),_react.default.createElement(_reactNative.View,{__self:this,__source:{fileName:_jsxFileName,lineNumber:467,columnNumber:25}})))),_react.default.createElement(_HideableView.default,{isHidden:!isLoadingAvailability,style:{position:'absolute',width:'100%',height:'100%'},__self:this,__source:{fileName:_jsxFileName,lineNumber:473,columnNumber:13}},_react.default.createElement(_reactNative.View,{style:{flex:1,margin:3,borderRadius:3,alignItems:'center',justifyContent:'center',backgroundColor:(0,_theme.alpha)(_theme.HelloDoctorColors.Blue500,0.05)},__self:this,__source:{fileName:_jsxFileName,lineNumber:476,columnNumber:17}},_react.default.createElement(_reactNative.ActivityIndicator,{animating:isLoadingAvailability,size:'large',color:_theme.HelloDoctorColors.Blue500,__self:this,__source:{fileName:_jsxFileName,lineNumber:485,columnNumber:21}}))),_react.default.createElement(_Modal.default,{visible:selectedDate!==undefined,__self:this,__source:{fileName:_jsxFileName,lineNumber:492,columnNumber:13}},_react.default.createElement(_reactNative.TouchableOpacity,{onPress:function onPress(){return setSelectedDate(undefined);},style:{position:'absolute',width:'100%',height:'100%'},__self:this,__source:{fileName:_jsxFileName,lineNumber:493,columnNumber:17}}),_react.default.createElement(_reactNative.View,{style:{backgroundColor:'white',borderRadius:12,margin:12,marginTop:48,padding:18},__self:this,__source:{fileName:_jsxFileName,lineNumber:501,columnNumber:17}},_react.default.createElement(_reactNative.View,{style:{flexDirection:'row',alignItems:'center',justifyContent:'center'},__self:this,__source:{fileName:_jsxFileName,lineNumber:509,columnNumber:21}},_react.default.createElement(_reactNative.Pressable,{onPress:function onPress(){return setSelectedDate(undefined);},__self:this,__source:{fileName:_jsxFileName,lineNumber:515,columnNumber:25}},_react.default.createElement(_reactNative.View,{style:{height:32,width:32,borderRadius:32,backgroundColor:_theme.HelloDoctorColors.Blue500},__self:this,__source:{fileName:_jsxFileName,lineNumber:516,columnNumber:29}})),_react.default.createElement(_reactNative.View,{style:{marginLeft:12},__self:this,__source:{fileName:_jsxFileName,lineNumber:526,columnNumber:25}},_react.default.createElement(_reactNative.Text,{style:{fontFamily:_theme.HelloDoctorFonts.TextBold,fontSize:18,color:_theme.ThemeColors.TextMain},__self:this,__source:{fileName:_jsxFileName,lineNumber:527,columnNumber:29}},(0,_moment.default)(selectedDate).format('dddd')),_react.default.createElement(_reactNative.Text,{style:{fontFamily:_theme.HelloDoctorFonts.TextRegular,fontSize:15,color:_theme.ThemeColors.TextSecondary},__self:this,__source:{fileName:_jsxFileName,lineNumber:535,columnNumber:29}},(0,_moment.default)(selectedDate).format('DD MMM YYYY')))),_react.default.createElement(_reactNative.ScrollView,{style:{maxHeight:396,marginTop:24},__self:this,__source:{fileName:_jsxFileName,lineNumber:545,columnNumber:21}},selectedDateAvailableTimes.map(function(availability,index){return _react.default.createElement(SelectableAvailability,{key:index,availability:availability,__self:_this3,__source:{fileName:_jsxFileName,lineNumber:548,columnNumber:33}});})))));}function SelectableAvailability(props){var availability=props.availability;var _useSchedulingContext5=(0,_scheduling2.useSchedulingContext)(),scheduledStart=_useSchedulingContext5.scheduledStart,setScheduledStart=_useSchedulingContext5.setScheduledStart;var isSelected=availability.start.getTime()===(scheduledStart==null?void 0:scheduledStart.getTime());var backgroundColor=isSelected?_theme.HelloDoctorColors.Blue500:'white';var color=isSelected?'#FFFFFF':_theme.HelloDoctorColors.Blue700;return _react.default.createElement(_reactNative.View,{style:{margin:12,marginBottom:6,marginTop:0},__self:this,__source:{fileName:_jsxFileName,lineNumber:576,columnNumber:9}},_react.default.createElement(_reactNative.TouchableOpacity,{onPress:function onPress(){return setScheduledStart(availability.start);},style:{margin:6,padding:6,borderRadius:24,flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:backgroundColor,borderWidth:1,borderColor:(0,_theme.alpha)(_theme.HelloDoctorColors.Blue500,0.1),elevation:1,shadowOffset:{height:1,width:1},shadowColor:_theme.HelloDoctorColors.Blue500,shadowRadius:2,shadowOpacity:0.3},__self:this,__source:{fileName:_jsxFileName,lineNumber:577,columnNumber:13}},_react.default.createElement(_reactNative.Text,{style:{fontFamily:_theme.HelloDoctorFonts.TextRegular,fontSize:18,color:color,marginLeft:4},__self:this,__source:{fileName:_jsxFileName,lineNumber:595,columnNumber:17}},(0,_moment.default)(availability.start).format('h:mm a'))));}function ConsultationReasonInput(){var _useState17=(0,_react.useState)(''),_useState18=(0,_slicedToArray2.default)(_useState17,2),consultationReason=_useState18[0],setConsultationReason=_useState18[1];console.debug('[ConsultationReasonInput]',{consultationReason:consultationReason});return _react.default.createElement(_TextInput.default,{placeholder:'Razón de la consulta',value:'FUCK YOU',onChangeText:function onChangeText(reason){console.debug('WHY THE FUCK',reason);},__self:this,__source:{fileName:_jsxFileName,lineNumber:613,columnNumber:9}});}