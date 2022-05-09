
import { readFileSync } from 'fs';
import nodeMailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import path from 'path';
import appConfig from '../config';

const proxySender = "MeerApp <noreply@meerapp.com>";

const smtpServerHost = 'smtp.gmail.com';
const smtpServerPort = 587;

const emailTemplate = {
  confirmEmail: readFileSync(path.resolve('nodemailer/template/confirmEmail.html'), 'utf-8'),
}

export function sendMail(to: any, subject: any, htmlContent: any) {
  const transporter = nodeMailer.createTransport({
    host: smtpServerHost,
    port: smtpServerPort,
    secure: false,
    auth: {
      user: appConfig.smtp_user,
      pass: appConfig.smtp_pwd,
    }
  })
  const options: Mail.Options = {
    from: proxySender,
    to: to,
    subject: subject,
    html: htmlContent
  }

  return transporter.sendMail(options)
}

export function sendConfirmEmail(receiver: string, link: string){
  const html = emailTemplate.confirmEmail.replace("${link}", link);
  const subject = "Please verify your email";
  return sendMail(receiver, subject, html);
}

export function sendTestMail() {
  try{
    return sendMail("bang2001vl@outlook.com.vn", "test-email", "<h3>Your email has been sent successfully.</h3>")
  } 
  catch(ex: any){
    console.log(ex);
    
  };
}

export default class NodeMailerHelper {
  sendMail = sendMail;
  sendConfirmEmail = sendConfirmEmail;
  sendTestMail = sendTestMail;
}