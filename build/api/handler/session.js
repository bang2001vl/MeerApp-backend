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
const uuid_1 = require("uuid");
const helper_1 = __importDefault(require("../../helper"));
const prisma_1 = require("../../prisma");
const tag = "Session";
class SessionHandler {
    static createSession(accountId, userId, deviceInfo, userRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = (0, uuid_1.v1)();
            helper_1.default.logger.traceWithTag("MYSQL, INSERT", "Start: Insert session");
            const newSession = yield prisma_1.myPrisma.session.create({
                data: {
                    token: token,
                    accountId: accountId,
                    userId: userId,
                    deviceInfo: deviceInfo,
                    userRole: userRole,
                }
            });
            helper_1.default.logger.traceWithTag("MYSQL, INSERT", "Success: Inserted session with token = " + token);
            return newSession;
        });
    }
    static sessionMiddleware(req, res, nxt) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = req.headers["token"];
            console.log("Start: Checking token");
            if (!token || typeof token !== "string") {
                res.status(401).send("Unathourized");
                return;
            }
            try {
                const session = yield prisma_1.myPrisma.session.findFirst({
                    where: {
                        token: token
                    }
                });
                if (!session) {
                    res.status(401).send("Unathourized");
                    return;
                }
                helper_1.default.logger.traceWithTag("Session", "[Accepted] Got request from session = " + JSON.stringify(session));
                res.locals.session = session;
                nxt();
            }
            catch (ex) {
                // System crashed
                helper_1.default.logger.errorWithTag(tag, ex);
                res.status(500).send("Server error: We catched some unexpected exception X.X");
            }
        });
    }
    /**
    * Middleware that only allow request with specific role pass-through
    * @param role Role that request must have
    * @returns Result middleware function
    */
    static roleChecker(roles) {
        const middlewares = [
            this.sessionMiddleware,
            (req, res, nxt) => {
                const session = res.locals.session;
                if (!session || !roles.includes(session.userRole)) {
                    res.status(400).send("Bad request: Permission required");
                    return;
                }
                nxt();
            }
        ];
        return middlewares;
    }
    static setData(sessionId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield prisma_1.myPrisma.session.update({
                where: {
                    id: sessionId
                },
                data: {
                    data: JSON.stringify(data),
                }
            });
        });
    }
}
exports.default = SessionHandler;
