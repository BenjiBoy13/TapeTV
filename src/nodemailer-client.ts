import nodemailer from 'nodemailer';
import { configuration as cf } from "./config";

export const mailTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: cf.email.user,
        pass: cf.email.appPassword
    }
});

export default mailTransport;