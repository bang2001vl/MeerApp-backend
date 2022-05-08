import { Router } from "express";
import { myPrisma } from "../../prisma";
import SessionHandler from "../handler/session";
import { UserDetailRoute } from "./user_detail";
import { buildResponseError, buildResponseSuccess } from "./utilities";
import { RouteBuilder } from "./_default";
import { RouteHandleWrapper } from "./_wrapper";

const tag = "UserInfo";
const repo = myPrisma.userInfo;

export const UserRoute = () => {
    const route = Router();

    route.get("/select",
        RouteBuilder.buildSelectInputParser(["fullname", "phone", "email"], ["fullname", "phone", "email"], tag),
        RouteBuilder.buildSelectRoute(repo, tag),
    );

    route.use("/detail", UserDetailRoute());

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

    return route;
}

async function findById(key: number){
    const result = await repo.findUnique({
        where: {id: key},
        include: {
            donedCampaign: {
                select: {campaign: true}
            },
            absentCampaign: {
                select: {campaign: true}
            },
            createdCampaign: true,
            joinedCampaign: {
                select: {campaign: true}
            },
            notdoneCampaign: {
                select: {campaign: true}
            },
            reportedCampaign: {
                select: {campaign: true}
            }
        }
    });
    
    return result;
}


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
