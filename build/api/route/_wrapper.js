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
exports.RouteHandleWrapper = exports.InputSource = void 0;
const multer_1 = __importDefault(require("multer"));
const helper_1 = __importDefault(require("../../helper"));
const utilities_1 = require("./utilities");
var InputSource;
(function (InputSource) {
    InputSource[InputSource["body"] = 0] = "body";
    InputSource[InputSource["query"] = 1] = "query";
    InputSource[InputSource["locals"] = 2] = "locals";
})(InputSource = exports.InputSource || (exports.InputSource = {}));
function getInput(req, res, source) {
    if (source === InputSource.body) {
        return req.body;
    }
    if (source === InputSource.query) {
        return req.query;
    }
    if (source === InputSource.locals) {
        return res.locals.input;
    }
}
exports.RouteHandleWrapper = {
    getInput,
    wrapMiddleware(handle, tag = "Default Tag", skipIfError = true) {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (skipIfError && res.locals.error) {
                next();
                return;
            }
            try {
                yield handle(req, res);
            }
            catch (ex) {
                console.log(ex);
                helper_1.default.logger.errorWithTag(tag, ex);
                const { errorCode = 2, errorMessage = "Unexpected error on server" } = ex;
                res.locals.error = (0, utilities_1.buildResponseError)(errorCode, errorMessage);
            }
            next();
        });
    },
    /**
     *
     * @param parseFunction
     * @param tag
     * @param inputSource Default is InputSource.body
     * @returns
     */
    wrapCheckInput(parseFunction, tag, inputSource = InputSource.body, onFailed) {
        return this.wrapMiddleware((req, res) => __awaiter(this, void 0, void 0, function* () {
            const input = getInput(req, res, inputSource);
            const inputParsed = yield parseFunction(input);
            try {
                // Check input
                if (!inputParsed) {
                    throw (0, utilities_1.buildResponseError)(1, "Invalid input");
                }
                // Pass input to locals
                res.locals.input = inputParsed;
            }
            catch (ex) {
                helper_1.default.logger.errorWithTag(tag, ex);
                const { errorCode = 2, errorMessage = "Unexpected error on server" } = ex;
                res.locals.error = (0, utilities_1.buildResponseError)(errorCode, errorMessage);
            }
        }), tag, true);
    },
    /**
     * Wrap a handle function to a middleware with input from inputsource
     * @param handle
     * @param tag
     * @param inputSource Default is InputSource.locals
     * @returns
     */
    wrapHandleInput(handle, tag, inputSource = InputSource.locals, onError) {
        return this.wrapMiddleware((req, res) => __awaiter(this, void 0, void 0, function* () {
            const input = getInput(req, res, inputSource);
            try {
                const result = yield handle(input);
                //helper.logger.trace("Result is " + JSON.stringify(result, null, 2));
                res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result);
                //helper.logger.trace("Locals is " + JSON.stringify(res.locals, null, 2));
            }
            catch (ex) {
                console.log(ex);
                helper_1.default.logger.errorWithTag(tag, ex);
                const { errorCode = 2, errorMessage = "Unexpected error on server" } = ex;
                res.locals.error = (0, utilities_1.buildResponseError)(errorCode, errorMessage);
            }
        }), tag, true);
    },
    wrapHandleError(handle, tag) {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (res.locals.error) {
                try {
                    yield handle(res.locals.error);
                }
                catch (ex) {
                    console.log(ex);
                    helper_1.default.logger.errorWithTag(tag, ex);
                    const { errorCode = 2, errorMessage = "Unexpected error on server" } = ex;
                    res.locals.error = (0, utilities_1.buildResponseError)(errorCode, errorMessage);
                }
            }
            next();
        });
    },
    wrapMulterUpload(upload) {
        return (req, res, next) => {
            upload(req, res, function (err) {
                if (err instanceof multer_1.default.MulterError) {
                    helper_1.default.logger.trace(JSON.stringify(err, null, 2));
                    res.locals.error = (0, utilities_1.buildResponseError)(5, "Upload file failed");
                }
                next();
            });
        };
    },
};
