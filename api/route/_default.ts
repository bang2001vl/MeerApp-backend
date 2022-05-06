import { PrismaDelegate } from "../../prisma";
import { InputSource, RouteHandleWrapper, WrapperErrorCallback } from "./_wrapper";

export const RouteBuilder = {
    buildInsertRoute(repo: PrismaDelegate, tag: string, inputSource = InputSource.locals, onError?: WrapperErrorCallback) {
        return RouteHandleWrapper.wrapHandleInput(async (input) => {
            const newRecord = await repo.create({
                data: input.data
            });
            return newRecord;
        }, tag, inputSource, onError);
    },

    buildInsertManyRoute(repo: PrismaDelegate, tag: string, inputSource = InputSource.locals, onError?: WrapperErrorCallback) {
        return RouteHandleWrapper.wrapHandleInput(async (input) => {
            const newRecord = await repo.createMany({
                data: input.data
            });
            return newRecord;
        }, tag, inputSource, onError);
    },

    buildUpdateRoute(repo: PrismaDelegate, tag: string, primarykeyName = "id", inputSource = InputSource.locals, onError?: WrapperErrorCallback) {
        return RouteHandleWrapper.wrapHandleInput(async (input) => {
            console.log(input);
            const updatedRecord = await repo.update({
                where: {
                    [primarykeyName]: input.key
                },
                data: input.data
            });
            return updatedRecord;
        }, tag, inputSource, onError);
    },

    buildDeleteRoute(repo: PrismaDelegate, tag: string, primarykeyName = "id", inputSource = InputSource.locals, onError?: WrapperErrorCallback) {
        return RouteHandleWrapper.wrapHandleInput(async (input) => {
            const result = await repo.deleteMany({
                where: {
                    [primarykeyName]: {
                        in: input.keys
                    }
                },
            });
            return result.count;
        }, tag, inputSource, onError);
    },

    buildSelectRoute(repo: PrismaDelegate, tag: string, customFilter?: (input: any) => any, select?: any, include?: any) {
        return RouteHandleWrapper.wrapHandleInput(async (input) => {
            const { searchby, searchvalue, orderby, orderdirection, start, count } = input;
            const filter = customFilter ? customFilter(input) : {};
            const result = await repo.findMany({
                where: {
                    [searchby]: (!searchvalue || searchvalue === '') ? undefined : {
                        contains: searchvalue
                    },
                    ...filter
                },
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
        }, tag);
    },

    buildCountRoute(repo: PrismaDelegate, tag: string, onError?: (err: any) => any) {
        return RouteHandleWrapper.wrapHandleInput(async (input) => {
            const { searchby, searchvalue } = input;
            const result = await repo.count({
                where: {
                    [searchby]: {
                        contains: searchvalue
                    },
                },
            });
            return result;
        }, tag);
    },

    buildCountInputParser(searchProperties: string[], tag: string) {
        return RouteHandleWrapper.wrapCheckInput((input) => {
            if (input
                && typeof input.searchby === "string"
                && typeof input.searchvalue === "string"
                && searchProperties.includes(input.searchby)
            ) {
                return input;
            }

            return undefined;
        }, tag, InputSource.query);
    },

    buildSelectInputParser(searchProperties: string[], orderProperties: string[], tag: string) {
        const checkFunc = () => { console.log("passed"); return true };
        return RouteHandleWrapper.wrapCheckInput((input) => {
            if (input
                && typeof input.searchby === "string"
                && typeof input.searchvalue === "string"
                && typeof input.orderby === "string"
                && typeof input.orderdirection === "string"
                && searchProperties.includes(input.searchby)
                && orderProperties.includes(input.orderby)
                && (input.orderdirection === "asc" || input.orderdirection === "desc")
                && !isNaN(input.start)
                && !isNaN(input.count)
            ) {
                input.start = parseInt(input.start);
                input.count = parseInt(input.count);

                return input;
            }

            return undefined;
        }, tag, InputSource.query);
    },

    buildKeysParser(tag: string, primarykeyType = "number", inputSource = InputSource.body) {
        return RouteHandleWrapper.wrapCheckInput((input) => {
            if (input
                && input.keys
            ) {
                if (Array.isArray(input.keys)) {
                    const keys: any[] = input.keys;
                    if (keys.every(k => typeof k === primarykeyType)) {
                        return input;
                    }
                }
                if (typeof input.keys === "string") {
                    const keys = input.keys.slice(",");
                    if (primarykeyType === "number") {
                        const keys_number: any[] = [];
                        for (let i = 0; i < keys.length; i++) {
                            try {
                                keys_number.push(parseInt(keys[i]))
                            }
                            catch (ex: any) {
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

}