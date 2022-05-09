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
exports.NotifySingleton = exports.startSocketIO = void 0;
const socket_io_1 = require("socket.io");
const config_1 = __importDefault(require("../config"));
const helper_1 = __importDefault(require("../helper"));
const prisma_1 = require("../prisma");
const tag = "SocketIO";
const io = new socket_io_1.Server();
io.on("connection", client => {
    helper_1.default.logger.traceWithTag(tag, "Got connection");
    client.on("authorize", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const token = data.token;
        if (token) {
            const session = yield prisma_1.myPrisma.session.findUnique({
                where: {
                    token: token
                }
            });
            if (session && session.userId) {
                client.join(getUserRoom(session.userId));
                client.join(getSessionRoom(session.token));
                client.emit("authorized");
                helper_1.default.logger.traceWithTag(tag, "Authorized with session: " + JSON.stringify(session, null, 2));
            }
        }
    }));
});
function getUserRoom(userId) {
    return `User${userId}`;
}
function getSessionRoom(token) {
    return `Session${token}`;
}
function startSocketIO() {
    io.listen(config_1.default.port_socketio);
    helper_1.default.logger.traceWithTag(tag, "Listening on port : " + config_1.default.port_socketio);
    return {
        io
    };
}
exports.startSocketIO = startSocketIO;
class NotifySingleton {
    static userGPSChanged(receiverId, userId, addtionalData) {
        io.to(getUserRoom(receiverId)).emit("usergps-changed", {
            userId,
            addtionalData
        });
    }
    static userGPSDeleted(receiverId, userId, addtionalData) {
        io.to(getUserRoom(receiverId)).emit("usergps-deleted", {
            userId,
            addtionalData
        });
    }
    static newEmergency(emergencyId, addtionalData) {
        io.emit("new-emergency", {
            emergencyId,
            addtionalData
        });
    }
    static newCampaigned(campaignId, addtionalData) {
        io.emit("new-campaign", {
            campaignId,
            addtionalData,
        });
    }
}
exports.NotifySingleton = NotifySingleton;
