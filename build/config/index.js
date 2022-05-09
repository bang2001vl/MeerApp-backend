"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const process_1 = require("process");
const helper_1 = __importDefault(require("../helper"));
(0, dotenv_1.config)();
if (!process.env.SMTP_USER || !process.env.SMTP_PWD) {
    console.log("Missing config of SMTP");
    (0, process_1.exit)(0);
}
const tag = "Config";
const appConfig = {
    port_http: myParseInt(process.env.PORT_HTTP) || 5000,
    port_https: myParseInt(process.env.PORT_HTTPS) || 5001,
    port_socketio: myParseInt(process.env.PORT_SOCKET_IO) || 5002,
    smtp_user: process.env.SMTP_USER,
    smtp_pwd: process.env.SMTP_PWD,
    publicFolder: process.env.PATH_PUBLIC_FOLDER || (0, path_1.resolve)(__dirname, "..", "public"),
    domain: process.env.DOMAIN || "http://thunderv-2.southeastasia.cloudapp.azure.com",
    tokenDuration: 5 * 60 * 60 * 1000, // 5 hours
};
//console.log(appConfig);
exports.default = appConfig;
function myParseInt(value) {
    if (value && !isNaN(value)) {
        try {
            return parseInt(value);
        }
        catch (ex) {
        }
    }
    helper_1.default.logger.traceWithTag(tag, "Cannot parse value(" + value + ") to number");
}
