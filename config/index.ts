import { config } from "dotenv";
import { resolve } from "path";
import { exit } from "process";
import helper from "../helper";

config();
if(!process.env.SMTP_USER || !process.env.SMTP_PWD){
    console.log("Missing config of SMTP");
    exit(0);
}

const tag = "Config";

const appConfig = {
    port_http : myParseInt(process.env.PORT_HTTP) || 5000,
    port_https: myParseInt(process.env.PORT_HTTPS) || 5001,
    port_socketio: myParseInt(process.env.PORT_SOCKET_IO) || 5002,

    smtp_user: process.env.SMTP_USER,
    smtp_pwd: process.env.SMTP_PWD,

    publicFolder: process.env.PATH_PUBLIC_FOLDER || resolve(__dirname,"..","public"),
    domain: process.env.DOMAIN || "http://thunderv-2.southeastasia.cloudapp.azure.com",

    tokenDuration : 5*60*60*1000, // 5 hours
}

//console.log(appConfig);


export default appConfig;

function myParseInt(value: any){
    if(value && !isNaN(value)){
        try{
            return parseInt(value);
        }
        catch(ex: any){
        }
    }
    helper.logger.traceWithTag(tag, "Cannot parse value(" + value + ") to number");
}