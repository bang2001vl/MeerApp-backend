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
                return input;
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
        }, tag)
    );

    return route;
};