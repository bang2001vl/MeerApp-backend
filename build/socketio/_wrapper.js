"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketWrapper = void 0;
exports.SocketWrapper = {
    wrapListener(listener) {
        return (socket) => {
            listener(socket);
        };
    }
};
