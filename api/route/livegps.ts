import { json, Router, urlencoded } from "express";
import helper from "../../helper";
import { myPrisma } from "../../prisma";
import { NotifySingleton } from "../../socketio";
import SessionHandler from "../handler/session";
import { buildResponseError, buildResponseSuccess, parseInputDeleted, parseInputKeys } from "./utilities";
import { RouteBuilder } from "./_default";
import { InputSource, RouteHandleWrapper } from "./_wrapper";

const tag = "LiveGPS";
const repo = myPrisma.userGPS;

export const LiveGPSRoute = () => {
    const route = Router();
    route.use(json());
    route.use(urlencoded({ extended: true }));

    route.post("/insert",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;
            const old = await repo.findFirst({
                where: { userId: userId }
            });
            if (old) {
                throw buildResponseError(4, "GPS already exists, update call or delete instead");
            }
        }),
        RouteHandleWrapper.wrapCheckInput(parseInputInsert, tag),
        addUserId,
        RouteBuilder.buildInsertRoute(repo, tag),
    );

    route.put("/update",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapCheckInput(parseInputInsert, tag),
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;
            helper.logger.traceWithTag(tag, userId);
            const data = res.locals.input.data;
            const result = await repo.update({
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
                NotifySingleton.userGPSChanged(e, userId, {
                    newlongitude: data.longitude,
                    newlatitude: data.latitude,
                });
            });

            res.locals.responseData = buildResponseSuccess({
                ...result,
                subscriptions: undefined,
            });
        }, tag, true),
    );

    route.delete("/delete",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;

            const result = await repo.delete({
                where: {
                    userId: userId
                },
                include: { subscriptions: true }
            });

            const subscriberIds = result.subscriptions.map(e => e.subscriberId);
            subscriberIds.forEach(e => {
                NotifySingleton.userGPSDeleted(e, userId, {
                    gpsId: result.id
                });
            });

            res.locals.responseData = buildResponseSuccess();
        }, tag, true),
    );

    route.post("/subscribes",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const input = req.body;
            const userId = res.locals.session.userId;
            if (input
                && Array.isArray(input.targetGPSIds)
                && input.targetGPSIds.every((e: any) => !isNaN(e))
            ) {
                const data: any[] = input.targetGPSIds.map((e: any) => {
                    return {
                        userGPSId: e,
                        subscriberId: userId,
                    }
                });
                helper.logger.traceWithTag(tag, JSON.stringify(data, null, 2));
                const result = await myPrisma.sUBSCRIBE_UserGPS.createMany({
                    data: data
                });
                res.locals.responseData = buildResponseSuccess(result);
            }
        }, tag, true),
    );

    route.post("/subscribeByUserId",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const input = req.body;
            const userId = res.locals.session.userId;
            if (input
                && !isNaN(input.targetId)
            ) {
                const targetId = parseInt(input.targetId);
                const targetGPS = await repo.findFirst({
                    where: { userId: targetId }
                });
                if (!targetGPS) {
                    throw buildResponseError(4, "Invalid target");
                }

                const result = await myPrisma.sUBSCRIBE_UserGPS.create({
                    data: {
                        subscriberId: userId,
                        userGPSId: targetGPS.id,
                    }
                });
                res.locals.responseData = buildResponseSuccess(result);
            }
        }, tag, true),
    );

    route.post("/unsubscribe",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapCheckInput((input) => {
            if (input
                && !isNaN(input.userGPSId)
            ) {
                return {
                    userGPSId: parseInt(input.userGPSId)
                }
            }
        }, tag, InputSource.query),
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userGPSId = res.locals.input.userGPSId;
            const userId = res.locals.session.userId;

            const result = await myPrisma.sUBSCRIBE_UserGPS.deleteMany({
                where: {
                    userGPSId: userGPSId,
                    subscriberId: userId,
                }
            });
            res.locals.responseData = buildResponseSuccess(result);
        }, tag, true),
    );

    route.post("/unsubscribeall",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;
            const result = await myPrisma.sUBSCRIBE_UserGPS.deleteMany({
                where: {
                    subscriberId: userId
                }
            });
            res.locals.responseData = buildResponseSuccess(result);
        }, tag, true),
    );

    route.get("/nearbyuser",
        RouteHandleWrapper.wrapCheckInput((input) => {
            if (input
                && !isNaN(input.longitude)
                && !isNaN(input.latitude)
                && !isNaN(input.maxdistance)
            ) {
                return {
                    longitude: parseFloat(input.longitude),
                    latitude: parseFloat(input.latitude),
                    maxdistance: parseFloat(input.maxdistance) || 10000,
                    start: helper.converter.parseInt(input.start) || 0,
                    count: helper.converter.parseInt(input.count) || 10000,
                }
            }
        }, tag, InputSource.query),
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const { longitude, latitude, maxdistance, start, count } = input;
            const result: any[] = await myPrisma.$queryRaw`SELECT c.userId as id, c.longitude,c.latitude, ST_Distance_Sphere(POINT(c.longitude, c.latitude), POINT(${longitude}, ${latitude})) as distance from user_gps as c having distance < ${maxdistance} LIMIT ${start}, ${count}`;
            return result;
        }, tag),
    )

    return route;
}

function parseInputInsert(input: any) {
    if (input
        && !isNaN(input.longitude)
        && !isNaN(input.latitude)
    ) {
        return {
            data: {
                longitude: parseFloat(input.longitude),
                latitude: parseFloat(input.latitude),
            }
        }
    }
}

const addUserId = RouteHandleWrapper.wrapMiddleware((req, res) => {
    res.locals.input.data.userId = res.locals.session.userId;
}, tag, true);