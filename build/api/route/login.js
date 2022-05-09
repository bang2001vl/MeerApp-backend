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
exports.routeLogin = void 0;
const express_1 = require("express");
const helper_1 = __importDefault(require("../../helper"));
const prisma_1 = require("../../prisma");
const session_1 = __importDefault(require("../handler/session"));
const utilities_1 = require("./utilities");
const _wrapper_1 = require("./_wrapper");
const tag = "Login";
const routeLogin = () => {
    const route = (0, express_1.Router)();
    route.use((0, express_1.json)());
    route.post("/", _wrapper_1.RouteHandleWrapper.wrapCheckInput(input => {
        if (input
            && input.account
            && typeof input.account.username === "string"
            && typeof input.account.password === "string"
            && typeof input.deviceInfo === "string") {
            return {
                data: {
                    account: {
                        username: input.account.username,
                        password: input.account.password,
                    },
                    deviceInfo: input.deviceInfo,
                }
            };
        }
    }, tag), _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(void 0, void 0, void 0, function* () {
        const data = input.data;
        const account = yield prisma_1.myPrisma.account.findFirst({
            where: {
                username: data.account.username,
                password: data.account.password,
            }
        });
        if (account) {
            const session = yield session_1.default.createSession(account.id, account.userId, data.deviceInfo, account.userRole);
            return {
                accountId: session.accountId,
                userId: session.userId,
                token: session.token,
                role: session.userRole,
            };
        }
        else {
            throw (0, utilities_1.buildResponseError)(2, "Wrong information");
        }
    }), tag));
    route.post("/hello", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        const user = yield prisma_1.myPrisma.userInfo.findUnique({
            where: { id: userId },
        });
        if (user) {
            res.json((0, utilities_1.buildResponseSuccess)({
                userId: userId,
                fullname: user.fullname,
                avatarImageURI: user.avatarImageURI,
            }));
        }
        else {
            res.json((0, utilities_1.buildResponseError)(401, "Invalid token"));
        }
    })));
    route.post("/signout", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        helper_1.default.logger.traceWithTag(tag, "Signout session: " + JSON.stringify(res.locals.session, null, 2));
        const sessionId = res.locals.session.id;
        const user = yield prisma_1.myPrisma.session.delete({
            where: { id: sessionId },
        });
        res.json((0, utilities_1.buildResponseSuccess)());
    })));
    return route;
};
exports.routeLogin = routeLogin;
