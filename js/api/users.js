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
var UsersServiceAPI = /** @class */ (function (_super) {
    __extends(UsersServiceAPI, _super);
    function UsersServiceAPI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UsersServiceAPI.prototype.createUser = function (account) {
        return this.post("/users", account);
    };
    UsersServiceAPI.prototype.authenticateUser = function (userID, serverAuthToken) {
        return this.post("/users/".concat(userID, "/_authenticate"), { refreshToken: serverAuthToken });
    };
    UsersServiceAPI.prototype.deleteUser = function (helloDoctorUserID) {
        return this.delete("/users/".concat(helloDoctorUserID));
    };
    return UsersServiceAPI;
}(http_1.default));
exports.default = new UsersServiceAPI();
