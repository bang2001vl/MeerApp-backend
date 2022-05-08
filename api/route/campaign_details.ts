import { Router } from "express";
import helper from "../../helper";
import { myPrisma } from "../../prisma";
import { InputSource, RouteHandleWrapper } from "./_wrapper";

const tag = "Campaign/Details";

export const CampaignDetailRoute = () => {
    const route = Router();

    route.get("/join",
        parseCampaignId,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const result = await myPrisma.jOIN_CompaignUser.findMany({
                where: {
                    campaignId: input.campaignId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullname: true,
                            avatarImageURI: true,
                        }
                    }
                },
                skip: input.start,
                take: input.count,
            });
            return result;
        }, tag),
    );

    route.get("/report",
        parseCampaignId,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const result = await myPrisma.rEPORT_CompaignUser.findMany({
                where: {
                    campaignId: input.campaignId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullname: true,
                            avatarImageURI: true,
                        }
                    }
                },
                skip: input.start,
                take: input.count,
            });
            return result;
        }, tag),
    );

    route.get("/done",
        parseCampaignId,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const result = await myPrisma.dONE_CompaignUser.findMany({
                where: {
                    campaignId: input.campaignId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullname: true,
                            avatarImageURI: true,
                        }
                    }
                },
                skip: input.start,
                take: input.count,
            });
            return result;
        }, tag),
    );
    
    route.get("/notdone",
        parseCampaignId,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const result = await myPrisma.nOTDONE_CompaignUser.findMany({
                where: {
                    campaignId: input.campaignId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullname: true,
                            avatarImageURI: true,
                        }
                    }
                },
                skip: input.start,
                take: input.count,
            });
            return result;
        }, tag),
    );
        
    route.get("/absent",
        parseCampaignId,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const result = await myPrisma.aBSENT_CompaignUser.findMany({
                where: {
                    campaignId: input.campaignId
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            fullname: true,
                            avatarImageURI: true,
                        }
                    }
                },
                skip: input.start,
                take: input.count,
            });
            return result;
        }, tag),
    );

    return route;
}

const parseCampaignId = RouteHandleWrapper.wrapCheckInput(input => {
    if (input
        && !isNaN(input.campaignId)
    ) {
        return {
            campaignId: parseInt(input.campaignId),
            start: helper.converter.parseInt(input.start),
            count: helper.converter.parseInt(input.count),
        }
    }
}, tag, InputSource.query);