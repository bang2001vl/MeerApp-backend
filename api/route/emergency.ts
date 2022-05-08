import { json, NextFunction, Request, Response, Router } from "express";
import { rmSync, unlinkSync } from "fs";
import multer from "multer";
import path from "path";
import { v1 } from "uuid";
import appConfig from "../../config";
import helper from "../../helper";
import { myPrisma } from "../../prisma";
import SessionHandler from "../handler/session"
import { EmergencyDetailRoute } from "./emergency_details";
import { buildResponseError, buildResponseSuccess, cacheOldImage, handleCleanUp, parsePathToPublicRelative } from "./utilities";
import { RouteBuilder } from "./_default";
import { RouteHandleWrapper } from "./_wrapper";
import { checkEmergencyOwner } from "./user";
import { NotifySingleton } from "../../socketio";

const DEFAULT_UPLOAD_FOLDER = path.resolve(appConfig.publicFolder, "uploads", "emergency");
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, DEFAULT_UPLOAD_FOLDER);
        },
        filename: (req, file, cb) => {
            helper.logger.trace("A");
            const unique = v1();
            const ext = path.extname(file.originalname);
            cb(null, unique + ext);
        }
    }),
})

const repo = myPrisma.emergency;
const tag = "Emergency";

export const EmergencyRoute = () => {
    const route = Router();
    route.use(json());

    route.get("/detail/id",
    RouteHandleWrapper.wrapMiddleware(async (req, res) => {
        let key: any = req.query.key;
        if (isNaN(key)) {
            throw buildResponseError(1, "Invalid input");
        }

        const result = await findDetail(parseInt(key));

        res.locals.responseData = buildResponseSuccess(result);
    }),
);

    route.get("/select",
        RouteBuilder.buildSelectInputParser(["title", "content"], ["title", "content", "createdAt"], tag),
        RouteBuilder.buildSelectRoute(repo, tag, undefined, undefined, {
            creator: {
                select: {
                    id: true,
                    fullname: true,
                    avatarImageURI: true,
                }
            }
        }),
    );

    route.get("/selectbycreatorid",
        RouteBuilder.buildSelectInputParser(["title", "content"], ["title", "content", "createdAt"], tag),
        RouteBuilder.buildSelectRoute(repo, tag, (input) => {
            if (!isNaN(input.creatorId)) {
                return {
                    creatorId: parseInt(input.creatorId),
                }
            }
            else {
                throw buildResponseError(1, "Not founded creatorId");
            }
        }),
    );

    route.get("/count",
        RouteBuilder.buildCountInputParser(["title", "content"], tag),
        RouteBuilder.buildCountRoute(repo, tag),
    );

    route.post("/insert",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMulterUpload(upload.fields([{ name: "image", maxCount: 1 }, { name: "banner", maxCount: 1 }])),
        RouteHandleWrapper.wrapCheckInput(parseInputInsert, tag),
        addCreatorId,
        addUploadedURIs,
        RouteBuilder.buildInsertRoute(repo, tag),
        RouteHandleWrapper.wrapMiddleware((req,res)=>{
            const record = res.locals.responseData.data;
            NotifySingleton.newEmergency(record.id, record);
        }, tag, true),
        handleCleanUp,
    );

    route.put("/update",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMulterUpload(upload.fields([{ name: "image", maxCount: 1 }, { name: "banner", maxCount: 1 }])),
        RouteHandleWrapper.wrapCheckInput(parseInputUpdate, tag),
        addUploadedURIs,
        cacheOldData,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            if (res.locals.session.userId !== res.locals.old.creatorId) {
                res.locals.error = buildResponseError(3, "Unauthorized");
            }
        }, tag, true),
        cacheOldImage(["imageURI", "bannerURI"]),
        RouteBuilder.buildUpdateRoute(repo, tag),
        handleCleanUp,
    );

    route.delete("/delete",
        SessionHandler.sessionMiddleware,
        RouteBuilder.buildKeysParser(tag),
        RouteHandleWrapper.wrapMiddleware(async (req: any, res) => {
            const userId = res.locals.session.userId;
            const keys = res.locals.input.keys;
            const oldRecords = await repo.findMany({
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
            if(!oldRecords.every(e=>e.creatorId === userId)){
                res.locals.error = buildResponseError(3, "Unauthorized");
            }
        }, tag, true),
        RouteBuilder.buildDeleteRoute(repo, tag),
        (req: any, res: Response, next: NextFunction) => {
            if (!res.locals.error && res.locals.oldImages) {
                res.locals.oldImages.forEach((e: any) => {
                    helper.logger.traceWithTag(tag, "Unlink path " + path.resolve(appConfig.publicFolder, e));
                    unlinkSync(path.resolve(appConfig.publicFolder, e));
                });
            }
            next();
        }
    );

    route.post("/finish",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapCheckInput(input => {
            if (input
                && !isNaN(input.emergencyId)
                && Array.isArray(input.userIds)
                && input.userIds.every((e: any) => typeof e === "number")
            ) {
                const emergencyId = parseInt(input.emergencyId);
                return {
                    emergencyId: emergencyId,
                    userIds: input.userIds
                }
            }
        }, tag),
        checkEmergencyOwner,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const emergencyId = input.emergencyId;
            const data = input.userIds.map((e: any) => {
                return {
                    emergencyId,
                    userId: e,
                }
            });
            const result = await myPrisma.dONE_EmergencyUser.createMany({
                data: data,
            });
            // Update emergency
            await repo.update({
                where: {id: emergencyId},
                data: {
                    status: 2
                }
            });
            return result;
        }, tag),
    );

    route.use("/detail", EmergencyDetailRoute());

    return route;
};

async function findDetail(key: number) {
    const result = await repo.findUnique({
        where: { id: key },
        include: {
            doned: {
                select: {
                    user: {
                        select: {
                            id: true,
                            fullname: true,
                            avatarImageURI: true,
                        }
                    }
                }
            },
        }
    });
    if (!result) {
        return {};
    }

    result.doned = result.doned.map(e => e.user) as any;
    return result;
}

function parseInputInsert(input: any) {
    helper.logger.traceWithTag(tag, "Have input : " + JSON.stringify(input, null, 2));
    if (input
        && typeof input.title === "string"
        && typeof input.content === "string"
        && typeof input.address === "string"
        && !isNaN(input.gpslongti)
        && !isNaN(input.gpslati)
    ) {
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

function parseInputUpdate(input: any) {
    helper.logger.trace(input);
    const insertInput = parseInputInsert(input);
    helper.logger.trace(JSON.stringify(insertInput, null, 2));
    if (insertInput
        && !isNaN(input.key)) {
        return {
            key: parseInt(input.key),
            data: insertInput.data
        }
    }
}

function addCreatorId(req: any, res: Response, next: NextFunction) {
    if (res.locals.session && res.locals.session.userId) {
        res.locals.input.data.creatorId = res.locals.session.userId;
    }
    else {
        helper.logger.traceWithTag(tag, "Session: " + JSON.stringify(res.locals.session, null, 2));
        res.locals.error = buildResponseError(3, "Unauthorized");
    }
    next();
}

function addUploadedURIs(req: any, res: Response, next: NextFunction) {
    if (!res.locals.error && req.files) {
        if (req.files["image"] && req.files["image"].length === 1) {
            res.locals.input.data["imageURI"] = parsePathToPublicRelative(req.files["image"][0].path);
        }
        if (req.files["banner"] && req.files["banner"].length === 1) {
            res.locals.input.data["bannerURI"] = parsePathToPublicRelative(req.files["banner"][0].path);
        }
        helper.logger.trace("Locals: " + JSON.stringify(res.locals, null, 2));
    }
    next();
}

const cacheOldData = RouteHandleWrapper.wrapMiddleware(async (req, res) => {
    const key = res.locals.input.key;
    if (key) {
        const old = await repo.findUnique({
            where: { id: key },
            select: {
                bannerURI: true,
                imageURI: true,
                creatorId: true,
            }
        });
        helper.logger.traceWithTag(tag, "Old = " + JSON.stringify(old, null, 2));
        res.locals.old = old;
    }
}, tag, true);