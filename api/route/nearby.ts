import { Router } from "express";
import helper from "../../helper";
import { myPrisma } from "../../prisma";
import { NotifySingleton } from "../../socketio";
import SessionHandler from "../handler/session";
import { buildResponseSuccess } from "./utilities";
import { InputSource, RouteHandleWrapper } from "./_wrapper";

const tag = "Nearby";

export const NearByRoute = () => {
    const route = Router();

    route.get("/campaign",
        addInput,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            return await findNearByCampaign(input.longitude, input.latitude, input.maxdistance, input.start, input.count);
        }, tag),
    );

    route.get("/emergency",
        addInput,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            return await findNearByEmergency(input.longitude, input.latitude, input.maxdistance, input.start, input.count);
        }, tag),
    );

    route.get("/user",
        addInput,
        RouteHandleWrapper.wrapHandleInput(async (input) => {
            return await findNearByEmergency(input.longitude, input.latitude, input.maxdistance, input.start, input.count);
        }, tag),
    );

    return route;
}

const addInput = RouteHandleWrapper.wrapCheckInput((input) => {
    if (input
        && !isNaN(input.longitude)
        && !isNaN(input.latitude)
        && !isNaN(input.maxdistance)
    ) {
        return {
            longitude: parseFloat(input.longitude),
            latitude: parseFloat(input.latitude),
            maxdistance: parseFloat(input.maxdistance) || 10000,
            start: helper.converter.parseInt(input.start) || 0,
            count: helper.converter.parseInt(input.count) || 10000,
        }
    }
}, tag, InputSource.query);

async function findNearByCampaign(longitude: number, latitude: number, maxdistance: number, start = 0, count = 100) {
    const result: any[] = await myPrisma.$queryRaw`SELECT c.id as id, c.title, c.dateTimeStart, c.gpslongti as longitude,c.gpslati as latitude, ST_Distance_Sphere(POINT(c.gpslongti, c.gpslati), POINT(${longitude}, ${latitude})) as distance from campaign as c having distance < ${maxdistance} LIMIT ${start}, ${count}`;
    return result;
}

async function findNearByEmergency(longitude: number, latitude: number, maxdistance: number, start = 0, count = 100) {
    const result: any[] = await myPrisma.$queryRaw`SELECT c.id as id, c.title, c.gpslongti as longitude,c.gpslati as latitude, ST_Distance_Sphere(POINT(c.gpslongti, c.gpslati), POINT(${longitude}, ${latitude})) as distance from emergency as c having distance < ${maxdistance} LIMIT ${start}, ${count}`;
    return result;
}

async function findNearByUser(longitude: number, latitude: number, maxdistance: number, start = 0, count = 100) {
    const result: any[] = await myPrisma.$queryRaw`SELECT c.id as gpsId, c.fullname, c.userId, ST_Distance_Sphere(POINT(c.longitude, c.latitude), POINT(${longitude}, ${latitude})) as distance from user_gps as c having distance < ${maxdistance}`;
    return result;
}