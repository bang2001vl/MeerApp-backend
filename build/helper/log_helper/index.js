"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyLogger = void 0;
class AppLogger {
    trace(msg) {
        console.log(msg);
    }
    traceWithTag(tag, msg) {
        console.log(`[${tag}] : ${msg}`);
    }
    error(msg) {
        console.error(msg);
    }
    errorWithTag(tag, ex) {
        console.log("Has error with tag: " + tag);
        console.log(JSON.stringify(ex, null, 2));
    }
}
exports.default = AppLogger;
exports.MyLogger = new AppLogger();
