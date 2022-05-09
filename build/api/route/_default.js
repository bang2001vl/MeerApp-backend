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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteBuilder = void 0;
const _wrapper_1 = require("./_wrapper");
exports.RouteBuilder = {
    buildInsertRoute(repo, tag, inputSource = _wrapper_1.InputSource.locals, onError) {
        return _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(this, void 0, void 0, function* () {
            const newRecord = yield repo.create({
                data: input.data
            });
            return newRecord;
        }), tag, inputSource, onError);
    },
    buildInsertManyRoute(repo, tag, inputSource = _wrapper_1.InputSource.locals, onError) {
        return _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(this, void 0, void 0, function* () {
            const newRecord = yield repo.createMany({
                data: input.data
            });
            return newRecord;
        }), tag, inputSource, onError);
    },
    buildUpdateRoute(repo, tag, primarykeyName = "id", inputSource = _wrapper_1.InputSource.locals, onError) {
        return _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(this, void 0, void 0, function* () {
            console.log(input);
            const updatedRecord = yield repo.update({
                where: {
                    [primarykeyName]: input.key
                },
                data: input.data
            });
            return updatedRecord;
        }), tag, inputSource, onError);
    },
    buildDeleteRoute(repo, tag, primarykeyName = "id", inputSource = _wrapper_1.InputSource.locals, onError) {
        return _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(this, void 0, void 0, function* () {
            const result = yield repo.deleteMany({
                where: {
                    [primarykeyName]: {
                        in: input.keys
                    }
                },
            });
            return result.count;
        }), tag, inputSource, onError);
    },
    buildSelectRoute(repo, tag, customFilter, select, include) {
        return _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(this, void 0, void 0, function* () {
            const { searchby, searchvalue, orderby, orderdirection, start, count } = input;
            const filter = customFilter ? customFilter(input) : {};
            const result = yield repo.findMany({
                where: Object.assign({ [searchby]: (!searchvalue || searchvalue === '') ? undefined : {
                        contains: searchvalue
                    } }, filter),
                orderBy: [
                    {
                        [orderby]: orderdirection,
                    },
                ],
                skip: start,
                take: count,
                select,
                include,
            });
            console.log(result);
            return result;
        }), tag);
    },
    buildCountRoute(repo, tag, onError) {
        return _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(this, void 0, void 0, function* () {
            const { searchby, searchvalue } = input;
            const result = yield repo.count({
                where: {
                    [searchby]: {
                        contains: searchvalue
                    },
                },
            });
            return result;
        }), tag);
    },
    buildCountInputParser(searchProperties, tag) {
        return _wrapper_1.RouteHandleWrapper.wrapCheckInput((input) => {
            if (input
                && typeof input.searchby === "string"
                //&& typeof input.searchvalue === "string"
                && searchProperties.includes(input.searchby)) {
                input.searchvalue = input.searchvalue || "";
                return input;
            }
            return undefined;
        }, tag, _wrapper_1.InputSource.query);
    },
    buildSelectInputParser(searchProperties, orderProperties, tag) {
        const checkFunc = () => { console.log("passed"); return true; };
        return _wrapper_1.RouteHandleWrapper.wrapCheckInput((input) => {
            if (input
                && typeof input.searchby === "string"
                //&& typeof input.searchvalue === "string"
                && typeof input.orderby === "string"
                && typeof input.orderdirection === "string"
                && searchProperties.includes(input.searchby)
                && orderProperties.includes(input.orderby)
                && (input.orderdirection === "asc" || input.orderdirection === "desc")
            //&& !isNaN(input.start)
            //&& !isNaN(input.count)
            ) {
                input.start = parseInt(input.start);
                input.count = parseInt(input.count);
                input.searchvalue = input.searchvalue || "";
                return input;
            }
            return undefined;
        }, tag, _wrapper_1.InputSource.query);
    },
    buildKeysParser(tag, primarykeyType = "number", inputSource = _wrapper_1.InputSource.body) {
        return _wrapper_1.RouteHandleWrapper.wrapCheckInput((input) => {
            if (input
                && input.keys) {
                if (Array.isArray(input.keys)) {
                    const keys = input.keys;
                    if (keys.every(k => typeof k === primarykeyType)) {
                        return input;
                    }
                }
                if (typeof input.keys === "string") {
                    const keys = input.keys.slice(",");
                    if (primarykeyType === "number") {
                        const keys_number = [];
                        for (let i = 0; i < keys.length; i++) {
                            try {
                                keys_number.push(parseInt(keys[i]));
                            }
                            catch (ex) {
                                return undefined;
                            }
                        }
                        return keys_number;
                    }
                    else {
                        return keys;
                    }
                }
            }
        }, tag, inputSource);
    },
};
