"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var express_1 = __importDefault(require("express"));
var users_1 = __importDefault(require("./routes/users"));
var auth_1 = __importDefault(require("./routes/auth"));
var logger_1 = require("./lib/logger");
var config_1 = require("./lib/config");
var cors_1 = __importDefault(require("cors"));
var characters_1 = __importDefault(require("./routes/characters"));
var result_1 = __importDefault(require("./routes/result"));
console.log("server file loaded");
var app = (0, express_1.default)();
var port = Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000);
// JSONを受け取れるようにする（POST/PUTで必要）
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: config_1.config.corsOrigin }));
app.use(function (req, _res, next) {
    (0, logger_1.logInfo)("request", { method: req.method, path: req.path });
    next();
});
app.get("/", function (_req, res) {
    res.send("root ok");
});
app.get("/health", function (_req, res) {
    res.json({ status: "ok" });
});
console.log("health route registered");
app.use("/users", users_1.default);
app.use(characters_1.default);
app.use(result_1.default);
app.use("/auth", auth_1.default);
app.use(function (err, _req, res, _next) {
    (0, logger_1.logError)("unexpected error", { err: String(err) });
    res.status(500).json({
        error: { code: "INTERNAL_SERVER_ERROR", message: "unexpected error" },
    });
});
//API起動時にダミーuserをインサート
// seedDemoUser().catch(console.error);
app.listen(port, function () {
    console.log("API listening on: http://localhost:".concat(port));
});
