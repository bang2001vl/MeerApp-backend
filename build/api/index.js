"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startExpress = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const config_1 = __importDefault(require("../config"));
const helper_1 = __importDefault(require("../helper"));
const campaign_1 = require("./route/campaign");
const emergency_1 = require("./route/emergency");
const livegps_1 = require("./route/livegps");
const login_1 = require("./route/login");
const nearby_1 = require("./route/nearby");
const signup_1 = require("./route/signup");
const user_1 = require("./route/user");
const tag = "API Server";
function startExpress() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use("/public", (0, express_1.static)(config_1.default.publicFolder));
    app.use("/login", (0, login_1.routeLogin)());
    app.use("/signup", (0, signup_1.signupRoute)());
    app.use("/campaign", (0, campaign_1.CampaignRoute)());
    app.use("/emergency", (0, emergency_1.EmergencyRoute)());
    app.use("/nearby", (0, nearby_1.NearByRoute)());
    app.use("/livegps", (0, livegps_1.LiveGPSRoute)());
    app.use("/user", (0, user_1.UserRoute)());
    app.use(handleResponse);
    // Start HTTP server
    app.listen(config_1.default.port_http, () => {
        helper_1.default.logger.traceWithTag(tag, "Listening HTTP on port = " + config_1.default.port_http);
    });
    // Start HTTPs server
    // const https = createServerHttps(app);
    // https.listen(config.port_https, () =>{
    //     logger.traceWithTag("Listening on port = " + config.port_https, "HTTPs");
    // });
    return {
        app
    };
}
exports.startExpress = startExpress;
function handleResponse(req, res, next) {
    if (res.locals.error) {
        res.json(res.locals.error);
    }
    else {
        res.json(res.locals.responseData);
    }
}
