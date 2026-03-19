"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationError = validationError;
exports.notFoundError = notFoundError;
function validationError(message, details) {
    if (details === void 0) { details = []; }
    return { error: { code: "VALIDATION_ERROR", message: message, details: details } };
}
function notFoundError(message) {
    return { error: { code: "NOT_FOUND", message: message } };
}
