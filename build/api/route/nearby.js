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
exports.NearByRoute = void 0;
const express_1 = require("express");
const helper_1 = __importDefault(require("../../helper"));
const prisma_1 = require("../../prisma");
const _wrapper_1 = require("./_wrapper");
const tag = "Nearby";
const NearByRoute = () => {
    const route = (0, express_1.Router)();
    route.get("/campaign", addInput, _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield findNearByCampaign(input.longitude, input.latitude, input.maxdistance, input.start, input.count);
    }), tag));
    route.get("/emergency", addInput, _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield findNearByEmergency(input.longitude, input.latitude, input.maxdistance, input.start, input.count);
    }), tag));
    route.get("/user", addInput, _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(void 0, void 0, void 0, function* () {
        return yield findNearByEmergency(input.longitude, input.latitude, input.maxdistance, input.start, input.count);
    }), tag));
    return route;
};
exports.NearByRoute = NearByRoute;
const addInput = _wrapper_1.RouteHandleWrapper.wrapCheckInput((input) => {
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
}, tag, _wrapper_1.InputSource.query);
function findNearByCampaign(longitude, latitude, maxdistance, start = 0, count = 100) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield prisma_1.myPrisma.$queryRaw `SELECT c.id as id, c.title, c.dateTimeStart, c.gpslongti as longitude,c.gpslati as latitude, ST_Distance_Sphere(POINT(c.gpslongti, c.gpslati), POINT(${longitude}, ${latitude})) as distance from campaign as c having distance < ${maxdistance} LIMIT ${start}, ${count}`;
        return result;
    });
}
function findNearByEmergency(longitude, latitude, maxdistance, start = 0, count = 100) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield prisma_1.myPrisma.$queryRaw `SELECT c.id as id, c.title, c.gpslongti as longitude,c.gpslati as latitude, ST_Distance_Sphere(POINT(c.gpslongti, c.gpslati), POINT(${longitude}, ${latitude})) as distance from emergency as c having distance < ${maxdistance} LIMIT ${start}, ${count}`;
        return result;
    });
}
function findNearByUser(longitude, latitude, maxdistance, start = 0, count = 100) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield prisma_1.myPrisma.$queryRaw `SELECT c.id as gpsId, c.fullname, c.userId, ST_Distance_Sphere(POINT(c.longitude, c.latitude), POINT(${longitude}, ${latitude})) as distance from user_gps as c having distance < ${maxdistance}`;
        return result;
    });
}
