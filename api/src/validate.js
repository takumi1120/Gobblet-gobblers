"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNonEmptyString = isNonEmptyString;
exports.looksLikeEmail = looksLikeEmail;
function isNonEmptyString(v) {
    return typeof v === "string" && v.trim().length > 0;
}
function looksLikeEmail(v) {
    return v.includes("@");
}
