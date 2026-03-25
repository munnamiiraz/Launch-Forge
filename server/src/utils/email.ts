/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";

const transporter = nodemailer.createTransport({
    host: envVars.EMAIL_SENDER.SMTP_HOST,
    port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
    // secure: true for 465, false for other ports (like 587)
    secure: Number(envVars.EMAIL_SENDER.SMTP_PORT) === 465, 
    // Force IPv4 to avoid ENETUNREACH errors on certain cloud platforms (like Render)
    family: 4, 
    auth: {
        user: envVars.EMAIL_SENDER.SMTP_USER,
        pass: envVars.EMAIL_SENDER.SMTP_PASS
    },
    // Adding TLS options for better compatibility in cloud environments
    tls: {
        rejectUnauthorized: false
    }
} as any);

// Verify connection on startup to log any config issues immediately
transporter.verify((error) => {
    if (error) {
        console.error("SMTP Connection Error:", error.message);
    } else {
        console.log("SMTP Server is ready to take messages");
    }
});

interface SendEmailOptions {
    to:            string;
    subject:       string;
    templateName:  string;
    templateData:  Record<string, any>;
    attachments?:  {
        filename:    string;
        content:     Buffer | string;
        contentType: string;
    }[]
}

export const sendEmail = async ({ subject, templateData, templateName, to, attachments }: SendEmailOptions) => {
    try {
        // Robust template path resolution for ESM and different environments
        const fs = await import("node:fs");
        const { fileURLToPath } = await import("node:url");
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const possiblePaths = [
            path.join(process.cwd(), "src", "templates", `${templateName}.ejs`),
            path.join(process.cwd(), "server", "src", "templates", `${templateName}.ejs`),
            path.resolve(__dirname, "..", "templates", `${templateName}.ejs`)
        ];

        let templatePath = "";
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                templatePath = p;
                break;
            }
        }

        if (!templatePath) {
            console.error("Email Template Not Found! Tried:", possiblePaths);
            throw new Error(`Email template ${templateName} not found.`);
        }
        
        const html = await ejs.renderFile(templatePath, templateData);

        const info = await transporter.sendMail({
            from:        envVars.EMAIL_SENDER.SMTP_FROM,
            to:          to,
            subject:     subject,
            html:        html,
            attachments: attachments?.map((attachment) => ({
                filename:    attachment.filename,
                content:     attachment.content,
                contentType: attachment.contentType,
            }))
        });

        console.log(`Email successfully sent to ${to}. MessageID: ${info.messageId}`);
    } catch (error: any) {
        console.error("Email Sending Failed!");
        console.error("Recipient:", to);
        console.error("Error Detail:", error.message);
        
        // Provide more context for common SMTP errors
        if (error.code === 'EAUTH') {
            console.error("Authentication failed. Please check your SMTP_USER and SMTP_PASS (use App Password for Gmail).");
        } else if (error.code === 'ESOCKET') {
            console.error("Socket error. This often happens if 'secure' flag doesn't match the port (465 requires secure: true, 587 requires secure: false).");
        }
        
        throw new AppError(status.INTERNAL_SERVER_ERROR, `Failed to send email to ${to}`);
    }
}