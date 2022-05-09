"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Converter {
    stringToDate(str) {
        if (!str) {
            return null;
        }
        return new Date(str);
    }
    parseInt(value) {
        if (value && !isNaN(value)) {
            try {
                return parseInt(value);
            }
            catch (ex) {
            }
        }
        //helper.logger.traceWithTag(tag, "Cannot parse value(" + value + ") to number");
    }
}
exports.default = Converter;
