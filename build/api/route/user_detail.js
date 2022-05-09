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
exports.UserDetailRoute = void 0;
const express_1 = require("express");
const helper_1 = __importDefault(require("../../helper"));
const prisma_1 = require("../../prisma");
const session_1 = __importDefault(require("../handler/session"));
const utilities_1 = require("./utilities");
const _wrapper_1 = require("./_wrapper");
const tag = "User/Detail";
const UserDetailRoute = () => {
    const route = (0, express_1.Router)();
    route.get("/campaign/created", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        const start = req.query.start;
        const count = req.query.count;
        const result = yield prisma_1.myPrisma.campaign.findMany({
            where: { creatorId: userId },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullname: true,
                        avatarImageURI: true,
                    }
                }
            },
            skip: !isNaN(start) ? parseInt(start) : undefined,
            take: !isNaN(count) ? parseInt(count) : undefined,
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result);
    }), tag));
    route.get("/campaign/doned", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        const start = req.query.start;
        const count = req.query.count;
        const result = yield prisma_1.myPrisma.jOIN_CompaignUser.findMany({
            where: { userId: userId },
            select: {
                campaign: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullname: true,
                                avatarImageURI: true,
                            }
                        }
                    },
                },
            },
            skip: !isNaN(start) ? parseInt(start) : undefined,
            take: !isNaN(count) ? parseInt(count) : undefined,
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result.map(e => e.campaign));
    }), tag));
    route.get("/campaign/notdoned", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        const start = req.query.start;
        const count = req.query.count;
        const result = yield prisma_1.myPrisma.nOTDONE_CompaignUser.findMany({
            where: { userId: userId },
            select: {
                campaign: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullname: true,
                                avatarImageURI: true,
                            }
                        }
                    },
                },
            },
            skip: !isNaN(start) ? parseInt(start) : undefined,
            take: !isNaN(count) ? parseInt(count) : undefined,
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result.map(e => e.campaign));
    }), tag));
    route.get("/campaign/absented", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        const start = req.query.start;
        const count = req.query.count;
        const result = yield prisma_1.myPrisma.aBSENT_CompaignUser.findMany({
            where: { userId: userId },
            select: {
                campaign: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullname: true,
                                avatarImageURI: true,
                            }
                        }
                    },
                },
            },
            skip: !isNaN(start) ? parseInt(start) : undefined,
            take: !isNaN(count) ? parseInt(count) : undefined,
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result.map(e => e.campaign));
    }), tag));
    route.get("/emergency/created", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        const start = req.query.start;
        const count = req.query.count;
        const result = yield prisma_1.myPrisma.emergency.findMany({
            where: { creatorId: userId },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullname: true,
                        avatarImageURI: true,
                    }
                }
            },
            skip: !isNaN(start) ? parseInt(start) : undefined,
            take: !isNaN(count) ? parseInt(count) : undefined,
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result);
    }), tag));
    route.get("/emergency/doned", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        const start = req.query.start;
        const count = req.query.count;
        const result = yield prisma_1.myPrisma.dONE_EmergencyUser.findMany({
            where: { userId: userId },
            select: {
                emergency: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullname: true,
                                avatarImageURI: true,
                            }
                        }
                    }
                },
            },
            skip: !isNaN(start) ? parseInt(start) : undefined,
            take: !isNaN(count) ? parseInt(count) : undefined,
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result.map(e => e.emergency));
    }), tag));
    route.get("/other/detailbyid", _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = helper_1.default.converter.parseInt(res.locals.query.userId);
        if (!userId) {
            throw (0, utilities_1.buildResponseError)(1, "Invalid input");
        }
        const result = yield prisma_1.myPrisma.userInfo.findUnique({
            where: { id: userId }
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result);
    }), tag));
    route.get("/other/campaign/created", _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = helper_1.default.converter.parseInt(res.locals.query.userId);
        if (!userId) {
            throw (0, utilities_1.buildResponseError)(1, "Invalid input");
        }
        const start = req.query.start;
        const count = req.query.count;
        const result = yield prisma_1.myPrisma.campaign.findMany({
            where: { creatorId: userId },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullname: true,
                        avatarImageURI: true,
                    }
                }
            },
            skip: !isNaN(start) ? parseInt(start) : undefined,
            take: !isNaN(count) ? parseInt(count) : undefined,
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result);
    }), tag));
    route.get("/other/campaign/doned", _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = helper_1.default.converter.parseInt(res.locals.query.userId);
        if (!userId) {
            throw (0, utilities_1.buildResponseError)(1, "Invalid input");
        }
        const start = req.query.start;
        const count = req.query.count;
        const result = yield prisma_1.myPrisma.jOIN_CompaignUser.findMany({
            where: { userId: userId },
            select: {
                campaign: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullname: true,
                                avatarImageURI: true,
                            }
                        }
                    },
                },
            },
            skip: !isNaN(start) ? parseInt(start) : undefined,
            take: !isNaN(count) ? parseInt(count) : undefined,
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result.map(e => e.campaign));
    }), tag));
    route.get("/other/campaign/notdoned", _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = helper_1.default.converter.parseInt(res.locals.query.userId);
        if (!userId) {
            throw (0, utilities_1.buildResponseError)(1, "Invalid input");
        }
        const start = req.query.start;
        const count = req.query.count;
        const result = yield prisma_1.myPrisma.nOTDONE_CompaignUser.findMany({
            where: { userId: userId },
            select: {
                campaign: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullname: true,
                                avatarImageURI: true,
                            }
                        }
                    },
                },
            },
            skip: !isNaN(start) ? parseInt(start) : undefined,
            take: !isNaN(count) ? parseInt(count) : undefined,
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result.map(e => e.campaign));
    }), tag));
    route.get("/other/campaign/absented", _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = helper_1.default.converter.parseInt(res.locals.query.userId);
        if (!userId) {
            throw (0, utilities_1.buildResponseError)(1, "Invalid input");
        }
        const start = req.query.start;
        const count = req.query.count;
        const result = yield prisma_1.myPrisma.aBSENT_CompaignUser.findMany({
            where: { userId: userId },
            select: {
                campaign: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullname: true,
                                avatarImageURI: true,
                            }
                        }
                    },
                },
            },
            skip: !isNaN(start) ? parseInt(start) : undefined,
            take: !isNaN(count) ? parseInt(count) : undefined,
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result.map(e => e.campaign));
    }), tag));
    route.get("/other/emergency/created", _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = helper_1.default.converter.parseInt(res.locals.query.userId);
        if (!userId) {
            throw (0, utilities_1.buildResponseError)(1, "Invalid input");
        }
        const start = req.query.start;
        const count = req.query.count;
        const result = yield prisma_1.myPrisma.emergency.findMany({
            where: { creatorId: userId },
            include: {
                creator: {
                    select: {
                        id: true,
                        fullname: true,
                        avatarImageURI: true,
                    }
                }
            },
            skip: !isNaN(start) ? parseInt(start) : undefined,
            take: !isNaN(count) ? parseInt(count) : undefined,
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result);
    }), tag));
    route.get("/other/emergency/doned", _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = helper_1.default.converter.parseInt(res.locals.query.userId);
        if (!userId) {
            throw (0, utilities_1.buildResponseError)(1, "Invalid input");
        }
        const start = req.query.start;
        const count = req.query.count;
        const result = yield prisma_1.myPrisma.dONE_EmergencyUser.findMany({
            where: { userId: userId },
            select: {
                emergency: {
                    include: {
                        creator: {
                            select: {
                                id: true,
                                fullname: true,
                                avatarImageURI: true,
                            }
                        }
                    }
                },
            },
            skip: !isNaN(start) ? parseInt(start) : undefined,
            take: !isNaN(count) ? parseInt(count) : undefined,
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result.map(e => e.emergency));
    }), tag));
    return route;
};
exports.UserDetailRoute = UserDetailRoute;
