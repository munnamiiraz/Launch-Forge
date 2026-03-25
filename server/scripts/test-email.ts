import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const config = {
    host: process.env.EMAIL_SENDER_SMTP_HOST,
    port: Number(process.env.EMAIL_SENDER_SMTP_PORT),
    user: process.env.EMAIL_SENDER_SMTP_USER,
    pass: process.env.EMAIL_SENDER_SMTP_PASS,
    from: process.env.EMAIL_SENDER_SMTP_FROM,
};

console.log("--- SMTP DIAGNOSTIC START ---");
console.log("Host:", config.host);
console.log("Port:", config.port);
console.log("User:", config.user);
console.log("From:", config.from);
console.log("Secure:", config.port === 465);

const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
        user: config.user,
        pass: config.pass,
    },
    tls: {
        rejectUnauthorized: false
    },
    debug: true, // Enable debug output
    logger: true // Log information to console
});

async function test() {
    try {
        console.log("\n1. Verifying connection...");
        await transporter.verify();
        console.log("   ✓ SMTP connection verified!");

        console.log("\n2. Sending test email...");
        const info = await transporter.sendMail({
            from: config.from,
            to: config.user, // Send to yourself
            subject: "LaunchForge SMTP Test",
            text: "If you are reading this, your SMTP configuration is working correctly!",
            html: "<b>If you are reading this, your SMTP configuration is working correctly!</b>"
        });

        console.log("   ✓ Email sent successfully!");
        console.log("   Message ID:", info.messageId);
        console.log("--- DIAGNOSTIC COMPLETE (SUCCESS) ---");
    } catch (error: any) {
        console.error("\n❌ DIAGNOSTIC FAILED!");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("Full Error:", error);
        console.log("--- DIAGNOSTIC COMPLETE (FAILURE) ---");
    }
}

test();
