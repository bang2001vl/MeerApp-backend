import { Router } from "express";
import { myPrisma } from "../../prisma";
import SessionHandler from "../handler/session";
import { buildResponseSuccess } from "./utilities";
import { RouteHandleWrapper } from "./_wrapper";

const tag = "User/Detail";

export const UserDetailRoute = () =>{
    const route = Router();

    route.get("/campaign/created",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;
            const start: any = req.query.start;
            const count: any = req.query.count;
            const result = await myPrisma.campaign.findMany({
                where: { creatorId: userId },
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
                    campaign: true,
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
                    campaign: true,
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
                    campaign: true,
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
                    emergency: true,
                },
                skip: !isNaN(start) ? parseInt(start) : undefined,
                take: !isNaN(count) ? parseInt(count) : undefined,
            });

            res.locals.responseData = buildResponseSuccess(result.map(e => e.emergency));
        }, tag),
    );

    return route;
}