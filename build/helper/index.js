"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const converter_1 = __importDefault(require("./converter"));
const log_helper_1 = __importDefault(require("./log_helper"));
const time_1 = __importDefault(require("./time"));
const uuid_1 = __importDefault(require("./uuid"));
const helper = {
    converter: new converter_1.default(),
    logger: new log_helper_1.default(),
    uuid: new uuid_1.default(),
    time: new time_1.default(),
};
exports.default = helper;
