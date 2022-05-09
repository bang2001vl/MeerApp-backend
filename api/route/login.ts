import { json, Router } from "express";
import helper from "../../helper";
import { myPrisma } from "../../prisma";
import SessionHandler from "../handler/session";
import { buildResponseError, buildResponseSuccess } from "./utilities";
import { RouteHandleWrapper } from "./_wrapper";

const tag = "Login";

export const routeLogin = () => {
    const route = Router();

    route.use(json());

    route.post("/",
        RouteHandleWrapper.wrapCheckInput(input => {
            if (
                input
                && input.account
                && typeof input.account.username === "string"
                && typeof input.account.password === "string"
                && typeof input.deviceInfo === "string"
            ) {
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
        }, tag),
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const data = input.data;
            const account = await myPrisma.account.findFirst({
                where: {
                    username: data.account.username,
                    password: data.account.password,
                }
            });
            if (account) {
                const session = await SessionHandler.createSession(account.id, account.userId, data.deviceInfo, account.userRole);
                return {
                    accountId: session.accountId,
                    userId: session.userId,
                    token: session.token,
                    role: session.userRole,
                };
            }
            else{
                throw buildResponseError(2, "Wrong information");
            }
        }, tag)
    );

    route.post("/hello",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;
            const user = await myPrisma.userInfo.findUnique({
                where: { id: userId },
            });
            if (user) {
                res.json(buildResponseSuccess({
                    userId: userId,
                    fullname: user.fullname,
                    avatarImageURI: user.avatarImageURI,
                }));
            }
            else {
                res.json(buildResponseError(401, "Invalid token"));
            }
        })
    );

    route.post("/signout",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            helper.logger.traceWithTag(tag, "Signout session: " + JSON.stringify(res.locals.session, null, 2));
            const sessionId = res.locals.session.id;
            const user = await myPrisma.session.delete({
                where: { id: sessionId },
            });
            res.json(buildResponseSuccess());
        })
    );

    return route;
};