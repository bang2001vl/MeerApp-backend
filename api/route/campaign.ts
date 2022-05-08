import { json, NextFunction, Request, Response, Router } from "express";
import { rmSync, unlinkSync } from "fs";
import multer from "multer";
import path from "path";
import { v1 } from "uuid";
import appConfig from "../../config";
import helper from "../../helper";
import { myPrisma } from "../../prisma";
import SessionHandler from "../handler/session"
import { CampaignDetailRoute } from "./campaign_details";
import { buildResponseError, buildResponseSuccess, cacheOldImage, handleCleanUp, parsePathToPublicRelative } from "./utilities";
import { RouteBuilder } from "./_default";
import { RouteHandleWrapper } from "./_wrapper";
import { checkCampaignOwner } from "./user";
import { NotifySingleton } from "../../socketio";

const DEFAULT_UPLOAD_FOLDER = path.resolve(appConfig.publicFolder, "uploads", "campaign");
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, DEFAULT_UPLOAD_FOLDER);
        },
        filename: (req, file, cb) => {
            helper.logger.trace("A");
            const unique = v1();
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + unique + ext);
        }
    }),
})

const repo = myPrisma.campaign;
const tag = "Campaign";

export const CampaignRoute = () => {
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
        RouteBuilder.buildSelectInputParser(["title", "content"], ["title", "content", "dateTimeStart", "createdAt"], tag),
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
        RouteBuilder.buildSelectInputParser(["title", "content"], ["title", "content", "dateTimeStart", "createdAt"], tag),
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
            NotifySingleton.newCampaigned(record.id, record);
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
            if (!oldRecords.every(e => e.creatorId === userId)) {
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

    route.post("/inviteuser",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapCheckInput(input => {
            if (input
                && !isNaN(input.campaignId)
                && Array.isArray(input.userIds)
                && input.userIds.every((e: any) => typeof e === "number")
            ) {
                const campaignId = parseInt(input.campaignId);
                return {
                    campaignId,
                    userIds: input.userIds,
                }
            }
        }, tag),
        checkCampaignOwner,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const campaignId = input.campaignId;
            const data = input.userIds.map((e: any) => {
                return {
                    campaignId,
                    userId: e,
                }
            });
            const result = await myPrisma.jOIN_CompaignUser.createMany({
                data: data,
            });
            return result;
        }, tag),
    );

    route.post("/kickuser",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapCheckInput(input => {
            if (input
                && !isNaN(input.campaignId)
                && Array.isArray(input.userIds)
                && input.userIds.every((e: any) => typeof e === "number")
            ) {
                const campaignId = parseInt(input.campaignId);
                return {
                    campaignId,
                    userIds: input.userIds
                }
            }
        }, tag),
        checkCampaignOwner,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const result = await myPrisma.jOIN_CompaignUser.deleteMany({
                where: {
                    userId: { in: input.userIds }
                },
            });
            return result;
        }, tag),
    );

    route.post("/finish",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapCheckInput(input => {
            if (input
                && !isNaN(input.campaignId)
                && Array.isArray(input.doneIds)
                && input.doneIds.every((e: any) => typeof e === "number")
                && Array.isArray(input.absentIds)
                && input.absentIds.every((e: any) => typeof e === "number")
            ) {
                const campaignId = parseInt(input.campaignId);
                return {
                    campaignId,
                    doneIds: input.doneIds,
                    absentIds: input.absentIds,
                }
            }
        }, tag),
        checkCampaignOwner,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const campaignId = input.campaignId;
            const doneIds: number[] = input.doneIds;
            const absentIds: number[] = input.absentIds;

            const joinIds = (await myPrisma.jOIN_CompaignUser.findMany({
                where: { campaignId: campaignId }
            })).map(e => e.userId);
            const joinAndDonesIds = doneIds.filter(e => joinIds.includes(e));
            const joinNotDoneIds = joinIds.filter(e => !joinAndDonesIds.includes(e));

            const [r1, r2, r3, r4] = await myPrisma.$transaction([
                myPrisma.dONE_CompaignUser.createMany({
                    data: doneIds.map((e: any) => {
                        return {
                            campaignId,
                            userId: e,
                        }
                    }),
                }),
                myPrisma.aBSENT_CompaignUser.createMany({
                    data: absentIds.map((e: any) => {
                        return {
                            campaignId,
                            userId: e,
                        }
                    }),
                }),
                myPrisma.nOTDONE_CompaignUser.createMany({
                    data: joinNotDoneIds.map(e => {
                        return {
                            campaignId: campaignId,
                            userId: e,
                        }
                    })
                }),
                repo.update({
                    where: { id: campaignId },
                    data: {
                        status: 2
                    }
                }),
            ])

            return true;
        }, tag),
    );

    route.use("/detail", CampaignDetailRoute());

    return route;
};

async function findDetail(key: number) {
    const result = await repo.findUnique({
        where: { id: key },
        include: {
            joined: {
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
            absent: {
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
            reported: {
                select: {
                    user: {
                        select: {
                            id: true,
                            fullname: true,
                            avatarImageURI: true,
                        }
                    },
                    reason: true,
                }
            },
            notdone: {
                select: {
                    user: {
                        select: {
                            id: true,
                            fullname: true,
                            avatarImageURI: true,
                        }
                    },
                }
            }
        }
    });
    if (!result) {
        return {};
    }

    result.joined = result.joined.map(e => e.user) as any;
    result.doned = result.doned.map(e => e.user) as any;
    result.absent = result.absent.map(e => e.user) as any;
    result.notdone = result.notdone.map(e => e.user) as any;
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
        && new Date(input.dateTimeStart)
    ) {
        return {
            data: {
                title: input.title,
                content: input.content,
                address: input.address,
                gpslongti: parseFloat(input.gpslongti),
                gpslati: parseFloat(input.gpslati),
                dateTimeStart: input.dateTimeStart,
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
