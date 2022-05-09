"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTestMail = exports.sendConfirmEmail = exports.sendMail = void 0;
const fs_1 = require("fs");
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../config"));
const proxySender = "MeerApp <noreply@meerapp.com>";
const smtpServerHost = 'smtp.gmail.com';
const smtpServerPort = 587;
const emailTemplate = {
    confirmEmail: (0, fs_1.readFileSync)(path_1.default.resolve('nodemailer/template/confirmEmail.html'), 'utf-8'),
};
function sendMail(to, subject, htmlContent) {
    const transporter = nodemailer_1.default.createTransport({
        host: smtpServerHost,
        port: smtpServerPort,
        secure: false,
        auth: {
            user: config_1.default.smtp_user,
            pass: config_1.default.smtp_pwd,
        }
    });
    const options = {
        from: proxySender,
        to: to,
        subject: subject,
        html: htmlContent
    };
    return transporter.sendMail(options);
}
exports.sendMail = sendMail;
function sendConfirmEmail(receiver, link) {
    const html = emailTemplate.confirmEmail.replace("${link}", link);
    const subject = "Please verify your email";
    return sendMail(receiver, subject, html);
}
exports.sendConfirmEmail = sendConfirmEmail;
function sendTestMail() {
    try {
        return sendMail("bang2001vl@outlook.com.vn", "test-email", "<h3>Your email has been sent successfully.</h3>");
    }
    catch (ex) {
        console.log(ex);
    }
    ;
}
exports.sendTestMail = sendTestMail;
class NodeMailerHelper {
    constructor() {
        this.sendMail = sendMail;
        this.sendConfirmEmail = sendConfirmEmail;
        this.sendTestMail = sendTestMail;
    }
}
exports.default = NodeMailerHelper;
