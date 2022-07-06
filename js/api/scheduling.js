"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("./http");
var SchedulingAPI = /** @class */ (function (_super) {
    __extends(SchedulingAPI, _super);
    function SchedulingAPI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SchedulingAPI.prototype.getAvailability = function (requestMode, specialty, fromTime, toTime) {
        return this.get("/scheduling/availability?requestMode=".concat(requestMode, "&specialty=").concat(specialty, "&fromTime=").concat(fromTime, "&toTime=").concat(toTime));
    };
    SchedulingAPI.prototype.requestConsultation = function (requestMode, specialty, startTime, reason) {
        return this.post("/scheduling/_request", {
            requestMode: requestMode,
            specialty: specialty,
            startTime: startTime,
            reason: reason
        });
    };
    return SchedulingAPI;
}(http_1.default));
exports.default = new SchedulingAPI();
