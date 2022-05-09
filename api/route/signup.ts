import dayjs from "dayjs";
import { json, Router, urlencoded } from "express";
import { sign, verify } from "jsonwebtoken";
import { userInfo } from "os";
import path from "path";
import appConfig from "../../config";
import helper from "../../helper";
import { sendConfirmEmail } from "../../nodemailer";
import { myPrisma } from "../../prisma";
import { buildResponseSuccess } from "./utilities";
import { RouteHandleWrapper } from "./_wrapper";


const secretJWT = "asdjb!@#!523BD#@$";
const optionJWT = {
    issuer: "n2tb",
    audience: "thunder-server-2",
}

const tag = "SignUp";

export const signupRoute = () => {
    const route = Router();
    route.use(json());

    route.post("/",
        RouteHandleWrapper.wrapCheckInput(parseInput, tag),
        RouteHandleWrapper.wrapMiddleware(async (req, res) => {
            const account = res.locals.input.data;
            const userInfo = account.userInfo.create;
            //console.log("Locals = " + JSON.stringify(res.locals, null, 2));

            // Create token
            const token = sign({
                account: account
            }, secretJWT, {
                ...optionJWT,
                expiresIn: 48 * 60 * 60, // 48 hours
            })
            const link = `http://${appConfig.domain}:${appConfig.port_http}/signup/verify?token=${token}`;

            // Send verify email
            const receiver = {
                email: userInfo.email,
                fullname: userInfo.fullname
            };
            await sendConfirmEmail(receiver.email, link);

            res.locals.responseData = buildResponseSuccess({
                message: "Please check your email to verify your account",
            });
        }, tag, true),
    );

    route.get("/test",
        async (req, res) => {
            res.sendFile(path.resolve("nodemailer/template/success.html"));
        },
    );

    route.get("/verify",
        async (req, res) => {
            helper.logger.traceWithTag(tag, "Got request");
            if (req.query
                && typeof req.query.token === "string"
            ) {
                const decoded = verify(req.query.token, secretJWT, optionJWT);
                if (decoded
                    && typeof decoded !== "string"
                    && decoded.account
                    && typeof decoded.account.username === "string"
                    && typeof decoded.account.password === "string"
                ) {
                    helper.logger.traceWithTag(tag, "Decoded: " + JSON.stringify(decoded, null, 2));
                    const result = await myPrisma.account.create({
                        data: {
                            ...decoded.account,
                            status: 1
                        },
                    });
                    helper.logger.traceWithTag(tag, "Signup sucessfull with account" + JSON.stringify(decoded.account, null, 2));
                    return res.sendFile(path.resolve("nodemailer/template/success.html"));
                }
            }
            
            helper.logger.traceWithTag(tag, "Invalid query: " + req.query);
            res.status(401);
        },
    );

    return route;
};


function parseInput(input: any) {
    if (input) {
        const inputAccount = parsedAccount(input.account);
        const inputUserInfo = parsedUserInfo(input.userInfo);
        if (inputAccount && inputUserInfo) {
            return {
                data: {
                    ...inputAccount,
                    userInfo: {
                        create: {
                            ...inputUserInfo
                        }
                    }
                }
            };
        }
    }
}

function parsedAccount(account: any) {
    if (account
        && typeof (account.username) === "string"
        && typeof (account.password) === "string"
    ) {
        return {
            username: account.username,
            password: account.password,
        };
    }
}

function parsedUserInfo(userInfo: any) {
    if (userInfo
        && typeof (userInfo.fullname) === "string"
        //&& typeof (userInfo.phone) === "string"
        //&& typeof (userInfo.email) === "string"
        && typeof (userInfo.address) === "string"
        && typeof (userInfo.description) === "string"
        && !isNaN(userInfo.gender)
        && new Date(userInfo.birthday)) {
        return {
            fullname: userInfo.fullname,
            phone: userInfo.phone,
            email: userInfo.email,
            address: userInfo.address,
            description: userInfo.description,
            gender: parseInt(userInfo.gender),
            birthday: userInfo.birthday,
        };
    }
}

/// After 5 hours, delete accounts which not verified before 5 hours ago
/// Means: Account which not verified will be delete between 5-10 hours
// setInterval(() => {
//     const min = dayjs().subtract(1, "minute").toISOString();
//     cleanAccount(min);
// }, 1 * 60 * 1000);

// async function cleanAccount(minCreateAt: Date | string) {
//     const result = await myPrisma.account.deleteMany({
//         where: {
//             AND: [
//                 {
//                     status: 0
//                 },
//                 {
//                     createdAt: {
//                         lte: minCreateAt
//                     }
//                 },
//             ]
//         }
//     });
//     return result;
// }