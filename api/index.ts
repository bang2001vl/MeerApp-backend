import cors from "cors";
import express, { NextFunction, Request, Response, static as expressStatic } from "express";
import appConfig from "../config";
import helper from "../helper";
import { CampaignRoute } from "./route/campaign";
import { EmergencyRoute } from "./route/emergency";
import { LiveGPSRoute } from "./route/livegps";
import { routeLogin } from "./route/login";
import { NearByRoute } from "./route/nearby";
import { signupRoute } from "./route/signup";
import { UserRoute } from "./route/user";

const tag = "API Server";

export function startExpress() {

    const app = express();

    app.use(cors());

    app.use("/public", expressStatic(appConfig.publicFolder));

    app.use("/login", routeLogin());
    app.use("/signup", signupRoute());

    app.use("/campaign", CampaignRoute());
    app.use("/emergency", EmergencyRoute());
    app.use("/nearby", NearByRoute());
    app.use("/livegps", LiveGPSRoute());

    app.use("/user", UserRoute())

    app.use(handleResponse);

    // Start HTTP server
    app.listen(appConfig.port_http, () => {
        helper.logger.traceWithTag(tag, "Listening HTTP on port = " + appConfig.port_http);
    });

    // Start HTTPs server
    // const https = createServerHttps(app);
    // https.listen(config.port_https, () =>{
    //     logger.traceWithTag("Listening on port = " + config.port_https, "HTTPs");
    // });

    return {
        app
    }
}

function handleResponse(req: Request, res: Response, next: NextFunction) {
    if (res.locals.error) {
        res.json(res.locals.error);
    }
    else {
        res.json(res.locals.responseData);
    }
}