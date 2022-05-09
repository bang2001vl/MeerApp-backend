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
exports.checkEmergencyOwner = exports.checkCampaignOwner = exports.UserRoute = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../../config"));
const helper_1 = __importDefault(require("../../helper"));
const prisma_1 = require("../../prisma");
const session_1 = __importDefault(require("../handler/session"));
const user_detail_1 = require("./user_detail");
const utilities_1 = require("./utilities");
const _default_1 = require("./_default");
const _wrapper_1 = require("./_wrapper");
const DEFAULT_UPLOAD_FOLDER = path_1.default.resolve(config_1.default.publicFolder, "uploads", "avatar");
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, DEFAULT_UPLOAD_FOLDER);
        },
        filename: (req, file, cb) => {
            const unique = (0, uuid_1.v1)();
            const ext = path_1.default.extname(file.originalname);
            cb(null, file.fieldname + unique + ext);
        }
    }),
});
const tag = "UserInfo";
const repo = prisma_1.myPrisma.userInfo;
const UserRoute = () => {
    const route = (0, express_1.Router)();
    route.use("/detail", (0, user_detail_1.UserDetailRoute)());
    route.get("/select", _default_1.RouteBuilder.buildSelectInputParser(["fullname", "phone", "email"], ["fullname", "phone", "email"], tag), _default_1.RouteBuilder.buildSelectRoute(repo, tag));
    route.post("/update", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMulterUpload(upload.fields([{ name: "avatarImage", maxCount: 1 }])), _wrapper_1.RouteHandleWrapper.wrapCheckInput(parseInputUpdate, tag), _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.locals.input.key = res.locals.session.userId;
    }), tag, true), addUploadedURIs, cacheOldData, (0, utilities_1.cacheOldImage)(["avatarImageURI"]), _default_1.RouteBuilder.buildUpdateRoute(repo, tag), utilities_1.handleCleanUp);
    route.post("/join/campaign", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapCheckInput(input => {
        if (input
            && !isNaN(input.campaignId)) {
            return {
                data: {
                    campaignId: parseInt(input.campaignId),
                }
            };
        }
    }, tag), exports.checkCampaignOwner, addUserId, _default_1.RouteBuilder.buildInsertRoute(prisma_1.myPrisma.jOIN_CompaignUser, tag));
    route.post("/report/campaign", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapCheckInput(input => {
        if (input
            && !isNaN(input.campaignId)
            && typeof input.reason === "string") {
            return {
                campaignId: parseInt(input.campaignId),
                reason: input.reason,
            };
        }
    }, tag), exports.checkCampaignOwner, addUserId, _default_1.RouteBuilder.buildInsertRoute(prisma_1.myPrisma.rEPORT_CompaignUser, tag));
    route.get("/detailbytoken", session_1.default.sessionMiddleware, _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = res.locals.session.userId;
        const result = yield repo.findUnique({
            where: { id: userId }
        });
        res.locals.responseData = (0, utilities_1.buildResponseSuccess)(result);
    }), tag));
    route.get("/exist/username", _wrapper_1.RouteHandleWrapper.wrapCheckInput(input => {
        if (input
            && typeof input.username === "string") {
            return input;
        }
    }, tag, _wrapper_1.InputSource.query), _wrapper_1.RouteHandleWrapper.wrapHandleInput((input) => __awaiter(void 0, void 0, void 0, function* () {
        const duplicate = yield prisma_1.myPrisma.account.findFirst({
            where: { username: input.username }
        });
        return (duplicate !== null);
    }), tag));
    return route;
};
exports.UserRoute = UserRoute;
function findById(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield repo.findUnique({
            where: { id: key },
            include: {
                donedCampaign: {
                    select: { campaign: true }
                },
                absentCampaign: {
                    select: { campaign: true }
                },
                createdCampaign: true,
                joinedCampaign: {
                    select: { campaign: true }
                },
                notdoneCampaign: {
                    select: { campaign: true }
                },
                reportedCampaign: {
                    select: { campaign: true }
                }
            }
        });
        return result;
    });
}
function parseInputInsert(input) {
    helper_1.default.logger.traceWithTag(tag, "Have input : " + JSON.stringify(input, null, 2));
    if (input
        && typeof input.fullname === "string"
        && new Date(input.birthday)
        && !isNaN(input.gender)) {
        return {
            data: {
                fullname: input.fullname,
                birthday: input.birthday,
                phone: input.phone,
                email: input.email,
                address: input.address || "Default address",
                description: input.description,
                gender: parseInt(input.gender),
            }
        };
    }
}
function parseInputUpdate(input) {
    helper_1.default.logger.trace(input);
    const insertInput = parseInputInsert(input);
    helper_1.default.logger.trace(JSON.stringify(insertInput, null, 2));
    if (insertInput) {
        return {
            // key is added later from session
            data: insertInput.data
        };
    }
}
function addUploadedURIs(req, res, next) {
    if (!res.locals.error && req.files) {
        if (req.files["avatarImage"] && req.files["avatarImage"].length === 1) {
            res.locals.input.data["avatarImageURI"] = (0, utilities_1.parsePathToPublicRelative)(req.files["avatarImage"][0].path);
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
                avatarImageURI: true,
            }
        });
        helper_1.default.logger.traceWithTag(tag, "Old = " + JSON.stringify(old, null, 2));
        res.locals.old = old;
    }
}), tag, true);
exports.checkCampaignOwner = _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const campaignId = res.locals.input.campaignId;
    if (!campaignId) {
        throw (0, utilities_1.buildResponseError)(1, "Invalid input");
    }
    const userId = res.locals.session.userId;
    const campaign = yield prisma_1.myPrisma.campaign.findUnique({
        where: { id: campaignId }
    });
    if (!campaign || campaign.creatorId !== userId) {
        throw (0, utilities_1.buildResponseError)(1, "Invalid campaign");
    }
    res.locals.campaign = campaign;
}));
exports.checkEmergencyOwner = _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const emergencyId = res.locals.input.emergencyId;
    if (!emergencyId) {
        throw (0, utilities_1.buildResponseError)(1, "Invalid input");
    }
    const userId = res.locals.session.userId;
    const emergency = yield prisma_1.myPrisma.emergency.findUnique({
        where: { id: emergencyId }
    });
    if (!emergency || emergency.creatorId !== userId) {
        throw (0, utilities_1.buildResponseError)(1, "Unvalid emergency");
    }
    res.locals.emergency = emergency;
}));
const addUserId = _wrapper_1.RouteHandleWrapper.wrapMiddleware((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.locals.input.data.userId = res.locals.session.userId;
}));
