"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    port: Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000),
    corsOrigin: (_b = process.env.CORS_ORIGIN) !== null && _b !== void 0 ? _b : "http://localhost:5173",
    nodeEnv: (_c = process.env.NODE_ENV) !== null && _c !== void 0 ? _c : "development",
};
