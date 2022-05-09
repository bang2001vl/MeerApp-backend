"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const dateTimeFormat = "YYYY-MM-DDTHH:mm:ssZ";
class TimeHelper {
    currentTimeUTC() {
        return new Date().toISOString();
    }
    convertToString(d) {
        return (0, dayjs_1.default)(d).format(dateTimeFormat);
    }
    currentTimeString() {
        return (0, dayjs_1.default)().format(dateTimeFormat);
    }
    isInFuture(dateTime) {
        return (0, dayjs_1.default)().isBefore(dateTime);
    }
    compare(a, b) {
        const dt1 = (0, dayjs_1.default)(a);
        const dt2 = (0, dayjs_1.default)(b);
        if (dt1.isAfter(dt2)) {
            return 1;
        }
        else if (dt1.isBefore(dt2)) {
            return -1;
        }
        else {
            // Equal
            return 0;
        }
    }
    getDayRange(date) {
        let target = (0, dayjs_1.default)(date);
        target = target.hour(0);
        target = target.minute(0);
        target = target.second(0);
        const start = target.format(dateTimeFormat);
        target = target.hour(23);
        target = target.minute(59);
        target = target.second(59);
        const end = target.format(dateTimeFormat);
        return {
            start,
            end,
        };
    }
}
exports.default = TimeHelper;
