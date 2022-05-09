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
exports.EmergencyRoute = void 0;
const express_1 = require("express");
const fs_1 = require("fs");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../../config"));
const helper_1 = __importDefault(require("../../helper"));
const prisma_1 = require("../../prisma");
const session_1 = __importDefault(require("../handler/session"));
const emergency_details_1 = require("./emergency_details");
const utilities_1 = require("./utilities");
const _default_1 = require("./_default");
const _wrapper_1 = require("./_wrapper");
const user_1 = require("./user");
const socketio_1 = require("../../socketio");
const DEFAULT_UPLOAD_FOLDER = path_1.default.resolve(config_1.default.publicFolder, "uploads", "emergency");
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, DEFAULT_UPLOAD_FOLDER);
        },
        filename: (req, file, cb) => {
            helper_1.default.logger.trace("A");
            const unique = (0, uuid_1.v1)();
            const ext = path_1.default.extname(file.originalname);
            cb(null, unique + ext);
        }
    }),
});
const repo = prisma_1.myPrisma.emergency;
const tag = "Emergency";
const EmergencyRoute = () => {
    const route = (0, express_1.Router)();
    route.use((0, express_1.json)());
    route.get("/detail/id", _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let key = req.query.key;
        if (isNaN(key)) {
            throw (0, utilities_1.buildResponseError)(1, "Invalid input");
        }
        const result = yield findDetail(parseInt(key));
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result);
    })));
    route.get("/select", _default_1.RouteBuilder.buildSelectInputParser(["title", "content"], ["title", "content", "createdAt"], tag), _default_1.RouteBuilder.buildSelectRoute(repo, tag, undefined, undefined, {
        creator: {
            select: {
                id: true,
                fullname: true,
                avatarImageURI: true,
            }
        }
    }));
    route.get("/selectbycreatorid", _default_1.RouteBuilder.buildSelectInputParser(["title", "content"], ["title", "content", "createdAt"], tag), _default_1.RouteBuilder.buildSelectRoute(repo, tag, (input) => {
        if (!isNaN(input.creatorId)) {
            return {
                creatorId: parseInt(input.creatorId),
            };
        }
        else {
            throw (0, utilities_1.buildResponseError)(1, "Not founded creatorId");
        }
    }));
    route.get("/count", _default_1.RouteBuilder.buildCountInputParser(["title", "content"], tag), _default_1.RouteBuilder.buildCountRoute(repo, tag));
    route.post("/insert", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMulterUpload(upload.fields([{ name: "image", maxCount: 1 }, { name: "banner", maxCount: 1 }])), _wrapper_1.RouteHandleWrapper.wrapCheckInput(parseInputInsert, tag), addCreatorId, addUploadedURIs, _default_1.RouteBuilder.buildInsertRoute(repo, tag), _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => {
        const record = res.locals.responseData.data;
        socketio_1.NotifySingleton.newEmergency(record.id, record);
    }, tag, true), utilities_1.handleCleanUp);
    route.put("/update", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMulterUpload(upload.fields([{ name: "image", maxCount: 1 }, { name: "banner", maxCount: 1 }])), _wrapper_1.RouteHandleWrapper.wrapCheckInput(parseInputUpdate, tag), addUploadedURIs, cacheOldData, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (res.locals.session.userId !== res.locals.old.creatorId) {
            res.locals.error = (0, utilities_1.buildResponseError)(3, "Unauthorized");
        }
    }), tag, true), (0, utilities_1.cacheOldImage)(["imageURI", "bannerURI"]), _default_1.RouteBuilder.buildUpdateRoute(repo, tag), utilities_1.handleCleanUp);
    route.delete("/delete", session_1.default.sessionMiddleware, _default_1.RouteBuilder.buildKeysParser(tag), _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        const keys = res.locals.input.keys;
        const oldRecords = yield repo.findMany({
            where: { id: { in: keys } },
            select: {
                creatorId: true,
                imageURI: true,
                bannerURI: true,
            }
        });
        res.locals.oldImages = [];
        for (let i = 0; i < oldRecords.length; i++) {
            const { imageURI, bannerURI } = oldRecords[i];
            if (imageURI) {
                res.locals.oldImages.push(imageURI);
            }
            if (bannerURI) {
                res.locals.oldImages.push(bannerURI);
            }
        }
        // User must not delete records which belong to other
        if (!oldRecords.every(e => e.creatorId === userId)) {
            res.locals.error = (0, utilities_1.buildResponseError)(3, "Unauthorized");
        }
    }), tag, true), _default_1.RouteBuilder.buildDeleteRoute(repo, tag), (req, res, next) => {
        if (!res.locals.error && res.locals.oldImages) {
            res.locals.oldImages.forEach((e) => {
                helper_1.default.logger.traceWithTag(tag, "Unlink path " + path_1.default.resolve(config_1.default.publicFolder, e));
                (0, fs_1.unlinkSync)(path_1.default.resolve(config_1.default.publicFolder, e));
            });
        }
        next();
    });
    route.post("/finish", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapCheckInput(input => {
        if (input
            && !isNaN(input.emergencyId)
            && Array.isArray(input.userIds)
            && input.userIds.every((e) => typeof e === "number")) {
            const emergencyId = parseInt(input.emergencyId);
            return {
                emergencyId: emergencyId,
                userIds: input.userIds
            };
        }
    }, tag), user_1.checkEmergencyOwner, _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(void 0, void 0, void 0, function* () {
        const emergencyId = input.emergencyId;
        const data = input.userIds.map((e) => {
            return {
                emergencyId,
                userId: e,
            };
        });
        const result = yield prisma_1.myPrisma.dONE_EmergencyUser.createMany({
            data: data,
        });
        // Update emergency
        yield repo.update({
            where: { id: emergencyId },
            data: {
                status: 2
            }
        });
        return result;
    }), tag));
    route.use("/detail", (0, emergency_details_1.EmergencyDetailRoute)());
    return route;
};
exports.EmergencyRoute = EmergencyRoute;
function findDetail(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield repo.findUnique({
            where: { id: key },
            include: {
                doned: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                fullname: true,
                                avatarImageURI: true,
                                email: true,
                                phone: true,
                            }
                        }
                    }
                },
                creator: {
                    select: {
                        id: true,
                        fullname: true,
                        avatarImageURI: true,
                        email: true,
                        phone: true,
                    }
                }
            }
        });
        if (!result) {
            return {};
        }
        result.doned = result.doned.map(e => e.user);
        return result;
    });
}
function parseInputInsert(input) {
    helper_1.default.logger.traceWithTag(tag, "Have input : " + JSON.stringify(input, null, 2));
    if (input
        && typeof input.title === "string"
        && typeof input.content === "string"
        && typeof input.address === "string"
        && !isNaN(input.gpslongti)
        && !isNaN(input.gpslati)) {
        return {
            data: {
                title: input.title,
                content: input.content,
                address: input.address,
                gpslongti: parseFloat(input.gpslongti),
                gpslati: parseFloat(input.gpslati),
            }
        };
    }
}
function parseInputUpdate(input) {
    helper_1.default.logger.trace(input);
    const insertInput = parseInputInsert(input);
    helper_1.default.logger.trace(JSON.stringify(insertInput, null, 2));
    if (insertInput
        && !isNaN(input.key)) {
        return {
            key: parseInt(input.key),
            data: insertInput.data
        };
    }
}
function addCreatorId(req, res, next) {
    if (res.locals.session && res.locals.session.userId) {
        res.locals.input.data.creatorId = res.locals.session.userId;
    }
    else {
        helper_1.default.logger.traceWithTag(tag, "Session: " + JSON.stringify(res.locals.session, null, 2));
        res.locals.error = (0, utilities_1.buildResponseError)(3, "Unauthorized");
    }
    next();
}
function addUploadedURIs(req, res, next) {
    if (!res.locals.error && req.files) {
        if (req.files["image"] && req.files["image"].length === 1) {
            res.locals.input.data["imageURI"] = (0, utilities_1.parsePathToPublicRelative)(req.files["image"][0].path);
        }
        if (req.files["banner"] && req.files["banner"].length === 1) {
            res.locals.input.data["bannerURI"] = (0, utilities_1.parsePathToPublicRelative)(req.files["banner"][0].path);
        }
        helper_1.default.logger.trace("Locals: " + JSON.stringify(res.locals, null, 2));
    }
    next();
}
const cacheOldData = _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const key = res.locals.input.key;
    if (key) {
        const old = yield repo.findUnique({
            where: { id: key },
            select: {
                bannerURI: true,
                imageURI: true,
                creatorId: true,
            }
        });
        helper_1.default.logger.traceWithTag(tag, "Old = " + JSON.stringify(old, null, 2));
        res.locals.old = old;
    }
}), tag, true);
