import { Router } from "express";
import { myPrisma } from "../../prisma";
import { InputSource, RouteHandleWrapper } from "./_wrapper";

const tag = "Nearby";

export const NearByRoute = () => {
    const route = Router();

    route.get("/campaign",
        RouteHandleWrapper.wrapCheckInput((input) => {
            if (input
                && !isNaN(input.longtitude)
                && !isNaN(input.latitude)
                && !isNaN(input.maxdistance)
            ) {
                return {
                    longtitude: parseFloat(input.longtitude),
                    latitude: parseFloat(input.latitude),
                    maxdistance: parseFloat(input.maxdistance),
                }
            }
        }, tag, InputSource.query),
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const { longtitude, latitude, maxdistance } = input;
            const result = await myPrisma.$queryRaw`SELECT c.id as campaignId, c.title, ST_Distance_Sphere(POINT(c.gpslongti, c.gpslati), POINT(${longtitude}, ${latitude})) as distance from campaign as c having distance < ${maxdistance}`;
            return result;
        }, tag),
    );
    
    route.get("/emergency",
        RouteHandleWrapper.wrapCheckInput((input) => {
            if (input
                && !isNaN(input.longtitude)
                && !isNaN(input.latitude)
                && !isNaN(input.maxdistance)
            ) {
                return {
                    longtitude: parseFloat(input.longtitude),
                    latitude: parseFloat(input.latitude),
                    maxdistance: parseFloat(input.maxdistance),
                }
            }
        }, tag, InputSource.query),
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            const { longtitude, latitude, maxdistance } = input;
            const result = await myPrisma.$queryRaw`SELECT c.id as emergencyId, c.title, ST_Distance_Sphere(POINT(c.gpslongti, c.gpslati), POINT(${longtitude}, ${latitude})) as distance from emergency as c having distance < ${maxdistance}`;
            return result;
        }, tag),
    );

    return route;
}