import { Server } from "socket.io";
import appConfig from "../config";
import helper from "../helper";
import { myPrisma } from "../prisma";
import { SocketWrapper } from "./_wrapper";

const tag = "SocketIO";

const io = new Server();

io.on("connection", client => {
    helper.logger.traceWithTag(tag, "Got connection");
    client.on("authorize", async data => {
        const token = data.token;
        if (token) {
            const session = await myPrisma.session.findUnique({
                where: {
                    token: token
                }
            });
            if (session && session.userId) {
                client.join(getUserRoom(session.userId));
                client.join(getSessionRoom(session.token));
                client.emit("authorized");
                helper.logger.traceWithTag(tag, "Authorized with session: " + JSON.stringify(session, null, 2));
            }
        }
    });

});

function getUserRoom(userId: number) {
    return `User${userId}`;
}
function getSessionRoom(token: string) {
    return `Session${token}`;
}

export function startSocketIO() {

    io.listen(appConfig.port_socketio);
    helper.logger.traceWithTag(tag, "Listening on port : " + appConfig.port_socketio);
    return {
        io
    };
}

export class NotifySingleton {
    static userGPSChanged(receiverId:number, userId: number, addtionalData: any) {
        io.to(getUserRoom(receiverId)).emit("usergps-changed", {
            userId,
            addtionalData
        });
    }
    static userGPSDeleted(receiverId:number, userId: number, addtionalData: any) {
        io.to(getUserRoom(receiverId)).emit("usergps-deleted", {
            userId,
            addtionalData
        });
    }
    static newEmergency(emergencyId: number, addtionalData: any) {
        io.emit("new-emergency", {
            emergencyId,
            addtionalData
        });
    }
    static newCampaigned(campaignId :number, addtionalData: any) {
        io.emit("new-campaign", {
            campaignId,
            addtionalData,
        });
    }
}