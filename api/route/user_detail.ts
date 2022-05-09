import { Router } from "express";
import helper from "../../helper";
import { myPrisma } from "../../prisma";
import SessionHandler from "../handler/session";
import { buildResponseError, buildResponseSuccess } from "./utilities";
import { RouteHandleWrapper } from "./_wrapper";

const tag = "User/Detail";

export const UserDetailRoute = () => {
    const route = Router();

    route.get("/campaign/created",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.campaign.findMany({
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

            res.locals.responseData = buildResponseSuccess(result);
        }, tag),
    );

    route.get("/campaign/doned",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.jOIN_CompaignUser.findMany({
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

            res.locals.responseData = buildResponseSuccess(result.map(e => e.campaign));
        }, tag),
    );

    route.get("/campaign/notdoned",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.nOTDONE_CompaignUser.findMany({
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

            res.locals.responseData = buildResponseSuccess(result.map(e => e.campaign));
        }, tag),
    );

    route.get("/campaign/absented",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.aBSENT_CompaignUser.findMany({
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

            res.locals.responseData = buildResponseSuccess(result.map(e => e.campaign));
        }, tag),
    );

    route.get("/emergency/created",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.emergency.findMany({
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
            res.locals.responseData = buildResponseSuccess(result);
        }, tag),
    );

    route.get("/emergency/doned",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.dONE_EmergencyUser.findMany({
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

            res.locals.responseData = buildResponseSuccess(result.map(e => e.emergency));
        }, tag),
    );

    route.get("/other/detailbyid",
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = helper.converter.parseInt(res.locals.query.userId);
            if (!userId) {
                throw buildResponseError(1, "Invalid input");
            }
            const result = await myPrisma.userInfo.findUnique({
                where: { id: userId }
            });

            res.locals.responseData = buildResponseSuccess(result);
        }, tag)
    );

    route.get("/other/campaign/created",
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = helper.converter.parseInt(res.locals.query.userId);
            if (!userId) {
                throw buildResponseError(1, "Invalid input");
            }
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.campaign.findMany({
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

            res.locals.responseData = buildResponseSuccess(result);
        }, tag),
    );

    route.get("/other/campaign/doned",
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = helper.converter.parseInt(res.locals.query.userId);
            if (!userId) {
                throw buildResponseError(1, "Invalid input");
            }
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.jOIN_CompaignUser.findMany({
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

            res.locals.responseData = buildResponseSuccess(result.map(e => e.campaign));
        }, tag),
    );

    route.get("/other/campaign/notdoned",
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = helper.converter.parseInt(res.locals.query.userId);
            if (!userId) {
                throw buildResponseError(1, "Invalid input");
            }
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.nOTDONE_CompaignUser.findMany({
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

            res.locals.responseData = buildResponseSuccess(result.map(e => e.campaign));
        }, tag),
    );

    route.get("/other/campaign/absented",
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = helper.converter.parseInt(res.locals.query.userId);
            if (!userId) {
                throw buildResponseError(1, "Invalid input");
            }
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.aBSENT_CompaignUser.findMany({
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

            res.locals.responseData = buildResponseSuccess(result.map(e => e.campaign));
        }, tag),
    );

    route.get("/other/emergency/created",
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = helper.converter.parseInt(res.locals.query.userId);
            if (!userId) {
                throw buildResponseError(1, "Invalid input");
            }
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.emergency.findMany({
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
            res.locals.responseData = buildResponseSuccess(result);
        }, tag),
    );

    route.get("/other/emergency/doned",
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = helper.converter.parseInt(res.locals.query.userId);
            if (!userId) {
                throw buildResponseError(1, "Invalid input");
            }
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.dONE_EmergencyUser.findMany({
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

            res.locals.responseData = buildResponseSuccess(result.map(e => e.emergency));
        }, tag),
    );

    return route;
}