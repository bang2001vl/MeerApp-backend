import { Server } from "socket.io";
import appConfig from "../config";
import helper from "../helper";
import { SocketWrapper } from "./_wrapper";

const tag = "SocketIO";

export function startSocketIO() {
    const io = new Server();

    io.on("connection", client => {
        helper.logger.traceWithTag(tag, "Got connection");
        client.on("authorize", data => {

        });
    });

    io.listen(appConfig.port_socketio);
    helper.logger.traceWithTag(tag, "Listening on port : " + appConfig.port_socketio);
    return {
        io
    };
}

const onConnection = SocketWrapper.wrapListener((client) => {
    helper.logger.traceWithTag(tag, "Got connection");
    client
});

const onAuthorized = SocketWrapper