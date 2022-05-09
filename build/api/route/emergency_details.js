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
exports.EmergencyDetailRoute = void 0;
const express_1 = require("express");
const helper_1 = __importDefault(require("../../helper"));
const prisma_1 = require("../../prisma");
const _wrapper_1 = require("./_wrapper");
const tag = "Emergency/Details";
const EmergencyDetailRoute = () => {
    const route = (0, express_1.Router)();
    route.get("/done", parseEmergencyId, _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield prisma_1.myPrisma.dONE_EmergencyUser.findMany({
            where: {
                emergencyId: input.emergencyId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullname: true,
                        avatarImageURI: true,
                    }
                }
            },
            skip: input.start,
            take: input.count,
        });
        return result;
    }), tag));
    return route;
};
exports.EmergencyDetailRoute = EmergencyDetailRoute;
const parseEmergencyId = _wrapper_1.RouteHandleWrapper.wrapCheckInput(input => {
    if (input
        && !isNaN(input.emergencyId)) {
        return {
            emergencyId: parseInt(input.emergencyId),
            start: helper_1.default.converter.parseInt(input.start),
            count: helper_1.default.converter.parseInt(input.count),
        };
    }
}, tag, _wrapper_1.InputSource.query);
