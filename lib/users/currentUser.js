"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = void 0;
var _currentUser = {
    uid: "",
    isThirdParty: true
};
function getCurrentUser() {
    return _currentUser;
}
exports.getCurrentUser = getCurrentUser;
