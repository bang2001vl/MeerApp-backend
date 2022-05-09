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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveGPSRoute = void 0;
const express_1 = require("express");
const helper_1 = __importDefault(require("../../helper"));
const prisma_1 = require("../../prisma");
const socketio_1 = require("../../socketio");
const session_1 = __importDefault(require("../handler/session"));
const utilities_1 = require("./utilities");
const _default_1 = require("./_default");
const _wrapper_1 = require("./_wrapper");
const tag = "LiveGPS";
const repo = prisma_1.myPrisma.userGPS;
const LiveGPSRoute = () => {
    const route = (0, express_1.Router)();
    route.use((0, express_1.json)());
    route.use((0, express_1.urlencoded)({ extended: true }));
    route.post("/insert", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        const old = yield repo.findFirst({
            where: { userId: userId }
        });
        if (old) {
            throw (0, utilities_1.buildResponseError)(4, "GPS already exists, update call or delete instead");
        }
    })), _wrapper_1.RouteHandleWrapper.wrapCheckInput(parseInputInsert, tag), addUserId, _default_1.RouteBuilder.buildInsertRoute(repo, tag));
    route.put("/update", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapCheckInput(parseInputInsert, tag), _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        helper_1.default.logger.traceWithTag(tag, userId);
        const data = res.locals.input.data;
        const result = yield repo.update({
            where: {
                userId: userId
            },
            data: data,
            include: {
                subscriptions: true,
            }
        });
        const subscriberIds = result.subscriptions.map(e => e.subscriberId);
        subscriberIds.forEach(e => {
            socketio_1.NotifySingleton.userGPSChanged(e, userId, {
                newlongitude: data.longitude,
                newlatitude: data.latitude,
            });
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(Object.assign(Object.assign({}, result), { subscriptions: undefined }));
    }), tag, true));
    route.delete("/delete", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        const result = yield repo.delete({
            where: {
                userId: userId
            },
            include: { subscriptions: true }
        });
        const subscriberIds = result.subscriptions.map(e => e.subscriberId);
        subscriberIds.forEach(e => {
            socketio_1.NotifySingleton.userGPSDeleted(e, userId, {
                gpsId: result.id
            });
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)();
    }), tag, true));
    route.post("/subscribes", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const input = req.body;
        const userId = res.locals.session.userId;
        if (input
            && Array.isArray(input.targetGPSIds)
            && input.targetGPSIds.every((e) => !isNaN(e))) {
            const data = input.targetGPSIds.map((e) => {
                return {
                    userGPSId: e,
                    subscriberId: userId,
                };
            });
            helper_1.default.logger.traceWithTag(tag, JSON.stringify(data, null, 2));
            const result = yield prisma_1.myPrisma.sUBSCRIBE_UserGPS.createMany({
                data: data
            });
            res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result);
        }
    }), tag, true));
    route.post("/subscribeByUserId", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const input = req.body;
        const userId = res.locals.session.userId;
        if (input
            && !isNaN(input.targetId)) {
            const targetId = parseInt(input.targetId);
            const targetGPS = yield repo.findFirst({
                where: { userId: targetId }
            });
            if (!targetGPS) {
                throw (0, utilities_1.buildResponseError)(4, "Invalid target");
            }
            const result = yield prisma_1.myPrisma.sUBSCRIBE_UserGPS.create({
                data: {
                    subscriberId: userId,
                    userGPSId: targetGPS.id,
                }
            });
            res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result);
        }
    }), tag, true));
    route.post("/unsubscribe", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapCheckInput((input) => {
        if (input
            && !isNaN(input.userGPSId)) {
            return {
                userGPSId: parseInt(input.userGPSId)
            };
        }
    }, tag, _wrapper_1.InputSource.query), _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userGPSId = res.locals.input.userGPSId;
        const userId = res.locals.session.userId;
        const result = yield prisma_1.myPrisma.sUBSCRIBE_UserGPS.deleteMany({
            where: {
                userGPSId: userGPSId,
                subscriberId: userId,
            }
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result);
    }), tag, true));
    route.post("/unsubscribeall", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        const result = yield prisma_1.myPrisma.sUBSCRIBE_UserGPS.deleteMany({
            where: {
                subscriberId: userId
            }
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result);
    }), tag, true));
    route.get("/nearbyuser", _wrapper_1.RouteHandleWrapper.wrapCheckInput((input) => {
        if (input
            && !isNaN(input.longitude)
            && !isNaN(input.latitude)
            && !isNaN(input.maxdistance)) {
            return {
                longitude: parseFloat(input.longitude),
                latitude: parseFloat(input.latitude),
                maxdistance: parseFloat(input.maxdistance) || 10000,
                start: helper_1.default.converter.parseInt(input.start) || 0,
                count: helper_1.default.converter.parseInt(input.count) || 10000,
            };
        }
    }, tag, _wrapper_1.InputSource.query), _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(void 0, void 0, void 0, function* () {
        const { longitude, latitude, maxdistance, start, count } = input;
        const result = yield prisma_1.myPrisma.$queryRaw `SELECT c.userId as id, c.longitude,c.latitude, ST_Distance_Sphere(POINT(c.longitude, c.latitude), POINT(${longitude}, ${latitude})) as distance from user_gps as c having distance < ${maxdistance} LIMIT ${start}, ${count}`;
        return result;
    }), tag));
    return route;
};
exports.LiveGPSRoute = LiveGPSRoute;
function parseInputInsert(input) {
    if (input
        && !isNaN(input.longitude)
        && !isNaN(input.latitude)) {
        return {
            data: {
                longitude: parseFloat(input.longitude),
                latitude: parseFloat(input.latitude),
            }
        };
    }
}
const addUserId = _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => {
    res.locals.input.data.userId = res.locals.session.userId;
}, tag, true);
