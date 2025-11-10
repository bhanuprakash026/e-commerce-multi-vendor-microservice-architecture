import nodemailer from "nodemailer";
import ejs from "ejs";
import dotenv from "dotenv";
import path from 'path';

dotenv.config();


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    service: process.env.SMTP_SERVICE, // set to true if using port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Render an EJS email Template
const renderEmailTemplate = async (templateName: string, data: Record<string, any>): Promise<string> => {
    const templatePath = path.join(
        process.cwd(),
        "apps",
        "auth-service",
        "src",
        "utils",
        "email-templates",
        `${templateName}.ejs`
    );

    return ejs.renderFile(templatePath, data)
};

// Send and email using nodemailer
export const sendeMail = async (to: string, data: Record<string, any>, template: string, subject: string) => {

    try {
        const html = await renderEmailTemplate(template, data);
    
        await transporter.sendMail({
            from: `<${process.env.SMTP_USER}`,
            to,
            subject,
            html
        });

        return true;
    } catch (error) {
        console.log("Error sending email", error);
        return false;
    }
}