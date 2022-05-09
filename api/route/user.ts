import { Request, Response, NextFunction, Router } from "express";
import multer from "multer";
import path from "path";
import { v1 } from "uuid";
import appConfig from "../../config";
import helper from "../../helper";
import { myPrisma } from "../../prisma";
import SessionHandler from "../handler/session";
import { UserDetailRoute } from "./user_detail";
import { buildResponseError, buildResponseSuccess, cacheOldImage, handleCleanUp, parsePathToPublicRelative } from "./utilities";
import { RouteBuilder } from "./_default";
import { InputSource, RouteHandleWrapper } from "./_wrapper";

const DEFAULT_UPLOAD_FOLDER = path.resolve(appConfig.publicFolder, "uploads", "avatar");
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, DEFAULT_UPLOAD_FOLDER);
        },
        filename: (req, file, cb) => {
            const unique = v1();
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + unique + ext);
        }
    }),
});

const tag = "UserInfo";
const repo = myPrisma.userInfo;

export const UserRoute = () => {
    const route = Router();

    route.use("/detail", UserDetailRoute());

    route.get("/select",
        RouteBuilder.buildSelectInputParser(["fullname", "phone", "email"], ["fullname", "phone", "email"], tag),
        RouteBuilder.buildSelectRoute(repo, tag),
    );

    route.post("/update",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMulterUpload(upload.fields([{ name: "avatarImage", maxCount: 1 }])),
        RouteHandleWrapper.wrapCheckInput(parseInputUpdate, tag),
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            res.locals.input.key = res.locals.session.userId;
        }, tag, true),
        addUploadedURIs,
        cacheOldData,
        cacheOldImage(["avatarImageURI"]),
        RouteBuilder.buildUpdateRoute(repo, tag),
        handleCleanUp,
    )

    route.post("/join/campaign",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapCheckInput(input => {
            if (input
                && !isNaN(input.campaignId)
            ) {
                return {
                    data: {
                        campaignId: parseInt(input.campaignId),
                    }
                }
            }
        }, tag),
        checkCampaignOwner,
        addUserId,
        RouteBuilder.buildInsertRoute(myPrisma.jOIN_CompaignUser, tag)
    );

    route.post("/report/campaign",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapCheckInput(input => {
            if (input
                && !isNaN(input.campaignId)
                && typeof input.reason === "string"
            ) {
                return {
                    campaignId: parseInt(input.campaignId),
                    reason: input.reason,
                }
            }
        }, tag),
        checkCampaignOwner,
        addUserId,
        RouteBuilder.buildInsertRoute(myPrisma.rEPORT_CompaignUser, tag)
    );

    route.get("/detailbytoken",
        SessionHandler.sessionMiddleware,
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const userId = res.locals.session.userId;
            const result = await repo.findUnique({
                where: { id: userId }
            });

            res.locals.responseData = buildResponseSuccess(result);
        }, tag)
    )

    route.get("/exist/username",
    RouteHandleWrapper.wrapCheckInput(input=>{
        if(input
            && typeof input.username === "string"
            ){
                return input;
            }
    }, tag, InputSource.query),
        RouteHandleWrapper.wrapHandleInput(async (input)=>{
            const duplicate = await myPrisma.account.findFirst({
                where:{username: input.username}
            });
            return (duplicate !== null);
        }, tag)
    )

    return route;
}

async function findById(key: number) {
    const result = await repo.findUnique({
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
}

function parseInputInsert(input: any) {
    helper.logger.traceWithTag(tag, "Have input : " + JSON.stringify(input, null, 2));
    if (input
        && typeof input.fullname === "string"
        && new Date(input.birthday)
        && !isNaN(input.gender)
    ) {
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
        }
    }
}

function parseInputUpdate(input: any) {
    helper.logger.trace(input);
    const insertInput = parseInputInsert(input);
    helper.logger.trace(JSON.stringify(insertInput, null, 2));
    if (insertInput) {
        return {
            // key is added later from session
            data: insertInput.data
        }
    }
}

function addUploadedURIs(req: any, res: Response, next: NextFunction) {
    if (!res.locals.error && req.files) {
        if (req.files["avatarImage"] && req.files["avatarImage"].length === 1) {
            res.locals.input.data["avatarImageURI"] = parsePathToPublicRelative(req.files["avatarImage"][0].path);
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
                avatarImageURI: true,
            }
        });
        helper.logger.traceWithTag(tag, "Old = " + JSON.stringify(old, null, 2));
        res.locals.old = old;
    }
}, tag, true);

export const checkCampaignOwner = RouteHandleWrapper.wrapMiddleware(async (req, res) => {
    const campaignId = res.locals.input.campaignId;
    if (!campaignId) {
        throw buildResponseError(1, "Invalid input");
    }

    const userId = res.locals.session.userId;
    const campaign = await myPrisma.campaign.findUnique({
        where: { id: campaignId }
    });

    if (!campaign || campaign.creatorId !== userId) {
        throw buildResponseError(1, "Invalid campaign");
    }

    res.locals.campaign = campaign;
});

export const checkEmergencyOwner = RouteHandleWrapper.wrapMiddleware(async (req, res) => {
    const emergencyId = res.locals.input.emergencyId;
    if (!emergencyId) {
        throw buildResponseError(1, "Invalid input");
    }

    const userId = res.locals.session.userId;
    const emergency = await myPrisma.emergency.findUnique({
        where: { id: emergencyId }
    });

    if (!emergency || emergency.creatorId !== userId) {
        throw buildResponseError(1, "Unvalid emergency");
    }

    res.locals.emergency = emergency;
});

const addUserId = RouteHandleWrapper.wrapMiddleware(async (req, res) => {
    res.locals.input.data.userId = res.locals.session.userId;
});
