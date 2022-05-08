import { Router } from "express";
import helper from "../../helper";
import { myPrisma } from "../../prisma";
import { InputSource, RouteHandleWrapper } from "./_wrapper";

const tag = "Emergency/Details";

export const EmergencyDetailRoute = () => {
    const route = Router();

    route.get("/done",
        parseEmergencyId,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const result = await myPrisma.dONE_EmergencyUser.findMany({
                where: {
                    emergencyId: input.emergencyId
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

const parseEmergencyId = RouteHandleWrapper.wrapCheckInput(input => {
    if (input
        && !isNaN(input.emergencyId)
    ) {
        return {
            emergencyId: parseInt(input.emergencyId),
            start: helper.converter.parseInt(input.start),
            count: helper.converter.parseInt(input.count),
        }
    }
}, tag, InputSource.query);