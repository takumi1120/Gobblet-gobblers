"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyToken = verifyToken;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var ACCESS_EXPIRES = "1s";
var REFRESH_EXPIRES = "7d";
function signAccessToken(payload) {
    var secret = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: ACCESS_EXPIRES,
    });
}
function signRefreshToken(payload) {
    var secret = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: REFRESH_EXPIRES,
    });
}
function verifyToken(token) {
    var secret = process.env.JWT_SECRET;
    return jsonwebtoken_1.default.verify(token, secret);
}
