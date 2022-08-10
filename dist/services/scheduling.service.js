Object.defineProperty(exports,"__esModule",{value:true});exports.getAvailability=getAvailability;exports.getUserConsultations=getUserConsultations;exports.requestConsultation=requestConsultation;var _http=require("../api/http");var httpClient=new _http.HelloDoctorHTTPClient();function getAvailability(requestMode,specialty,startTime,endTime){var path="/scheduling/availability?requestMode="+requestMode+"&specialty="+specialty+"&start="+startTime.toISOString()+"&end="+endTime.toISOString();return httpClient.get(path).then(function(getAvailabilityResponse){function serializeSchedulingAvailability(availability){return Object.assign({},availability,{start:new Date(availability.interval.start),end:new Date(availability.interval.end)});}return getAvailabilityResponse.availableTimes.map(serializeSchedulingAvailability);});}function requestConsultation(requestMode,specialty,startTime,reason){return httpClient.post('/scheduling/_request',{requestMode:requestMode,specialty:specialty,startTime:startTime,reason:reason});}function getUserConsultations(limit){return httpClient.get("/consultations?limit="+limit);}