"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const socketio_1 = require("./socketio");
const app = (0, api_1.startExpress)();
const io = (0, socketio_1.startSocketIO)();
