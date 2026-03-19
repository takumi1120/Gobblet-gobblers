"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
var express_1 = __importDefault(require("express"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var db_1 = require("../lib/db");
var jwt_1 = require("../lib/jwt");
exports.authRouter = express_1.default.Router();
function isJwtPayload(value) {
    if (!value || typeof value !== "object")
        return false;
    var v = value;
    return typeof v.sub === "number" && typeof v.email === "string";
}
exports.authRouter.post("/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, secret, r, user, accessToken, refreshToken;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = (_b = req.body) !== null && _b !== void 0 ? _b : {}, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({ message: "email と password は必須です" })];
                }
                secret = process.env.JWT_SECRET;
                if (!secret) {
                    return [2 /*return*/, res.status(500).json({ message: "JWT_SECRET が未設定です" })];
                }
                return [4 /*yield*/, db_1.pool.query("SELECT id, email, password FROM users WHERE email = $1", [email.trim()])];
            case 1:
                r = _c.sent();
                if (r.rowCount === 0) {
                    return [2 /*return*/, res.status(401).json({ message: "メールアドレスまたはパスワードが違います" })];
                }
                user = r.rows[0];
                if (!user.password || user.password !== password) {
                    return [2 /*return*/, res.status(401).json({ message: "メールアドレスまたはパスワードが違います" })];
                }
                accessToken = (0, jwt_1.signAccessToken)({
                    sub: user.id,
                    email: user.email,
                });
                refreshToken = (0, jwt_1.signRefreshToken)({
                    sub: user.id,
                });
                return [4 /*yield*/, db_1.pool.query("INSERT INTO refresh_tokens (user_id, token, expires_at)\n   VALUES ($1,$2, NOW() + interval '7 days')", [user.id, refreshToken])];
            case 2:
                _c.sent();
                return [2 /*return*/, res.json({
                        token: accessToken,
                        refreshToken: refreshToken,
                    })];
        }
    });
}); });
exports.authRouter.get("/me", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var secret, auth, _a, type, token, decoded, userId, r, user, _b;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                secret = process.env.JWT_SECRET;
                if (!secret) {
                    return [2 /*return*/, res.status(500).json({ message: "JWT_SECRET が未設定です" })];
                }
                auth = (_c = req.headers.authorization) !== null && _c !== void 0 ? _c : "";
                _a = auth.split(" "), type = _a[0], token = _a[1];
                if (type !== "Bearer" || !token) {
                    return [2 /*return*/, res.status(401).json({ message: "認証が必要です" })];
                }
                _e.label = 1;
            case 1:
                _e.trys.push([1, 3, , 4]);
                decoded = jsonwebtoken_1.default.verify(token, secret);
                if (!isJwtPayload(decoded)) {
                    return [2 /*return*/, res.status(401).json({ message: "token が不正です" })];
                }
                userId = decoded.sub;
                return [4 /*yield*/, db_1.pool.query("SELECT id, email, name FROM users WHERE id = $1", [userId])];
            case 2:
                r = _e.sent();
                if (r.rowCount === 0) {
                    return [2 /*return*/, res.status(401).json({ message: "ユーザーが存在しません" })];
                }
                user = r.rows[0];
                return [2 /*return*/, res.json({
                        user: {
                            id: user.id,
                            email: user.email,
                            name: (_d = user.name) !== null && _d !== void 0 ? _d : "",
                        },
                    })];
            case 3:
                _b = _e.sent();
                return [2 /*return*/, res.status(401).json({ message: "token が無効です" })];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.authRouter.post("/refresh", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken, decoded, r, userId, user, accessToken, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                refreshToken = req.body.refreshToken;
                if (!refreshToken) {
                    return [2 /*return*/, res.status(401).json({ message: "refresh token required" })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                decoded = (0, jwt_1.verifyToken)(refreshToken);
                return [4 /*yield*/, db_1.pool.query("SELECT * FROM refresh_tokens\n       WHERE token=$1 AND revoked_at IS NULL", [refreshToken])];
            case 2:
                r = _b.sent();
                if (r.rowCount === 0) {
                    return [2 /*return*/, res.status(401).json({ message: "invalid refresh token" })];
                }
                userId = decoded.sub;
                return [4 /*yield*/, db_1.pool.query("SELECT id,email FROM users WHERE id=$1", [userId])];
            case 3:
                user = _b.sent();
                if (user.rowCount === 0) {
                    return [2 /*return*/, res.status(401).json({ message: "user not found" })];
                }
                accessToken = (0, jwt_1.signAccessToken)({
                    sub: user.rows[0].id,
                    email: user.rows[0].email,
                });
                return [2 /*return*/, res.json({
                        token: accessToken,
                    })];
            case 4:
                _a = _b.sent();
                return [2 /*return*/, res.status(401).json({
                        message: "refresh token invalid",
                    })];
            case 5: return [2 /*return*/];
        }
    });
}); });
exports.authRouter.post("/logout", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refreshToken;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                refreshToken = req.body.refreshToken;
                if (!refreshToken) {
                    return [2 /*return*/, res.json({ ok: true })];
                }
                return [4 /*yield*/, db_1.pool.query("UPDATE refresh_tokens\n     SET revoked_at = NOW()\n     WHERE token = $1", [refreshToken])];
            case 1:
                _a.sent();
                return [2 /*return*/, res.json({ ok: true })];
        }
    });
}); });
exports.default = exports.authRouter;
