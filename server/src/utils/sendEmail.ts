 import nodemailer from "nodemailer";
import config from "../config/index.js";
import { Ui } from "../models/ui.model.js";

/**
 * Utility to send email.
 * Includes anti-spam best practices: plain-text fallback, proper headers, reply-to.
 * Falls back to console log printing if SMTP configs are missing.
 */
export const sendEmail = async (to: string, subject: string, html: string, plainText?: string) => {
    let host, port, user, pass, from;

    // First try to use UI/Admin configured SMTP settings
    try {
        const uiData = await Ui.findOne();
        if (uiData?.smtp?.user && uiData?.smtp?.pass) {
            host = uiData.smtp.host || "smtp.gmail.com";
            port = uiData.smtp.port || 587;
            user = uiData.smtp.user;
            pass = uiData.smtp.pass;
            from = uiData.smtp.from;
        }
    } catch (e) {
        console.error("Failed to fetch UI SMTP settings", e);
    }

    // Fallback to .env config if Admin settings are missing
    if (!user || !pass) {
        const smtpConfig = (config as any).smtp || {};
        host = smtpConfig.host;
        port = smtpConfig.port;
        user = smtpConfig.user;
        pass = smtpConfig.pass;
        from = smtpConfig.from;
    }

    if (host && user && pass) {
        try {
            const transporter = nodemailer.createTransport({
                host,
                port: Number(port) || 587,
                secure: Number(port) === 465,
                auth: {
                    user,
                    pass,
                },
            });

            const senderAddress = from || user;

            await transporter.sendMail({
                from: `"MenBazar" <${senderAddress}>`,
                replyTo: senderAddress,
                to,
                subject,
                // Plain text version — critical for spam avoidance
                text: plainText || html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
                html,
                headers: {
                    "X-Mailer": "MenBazar Mailer",
                    "Precedence": "bulk",
                },
            });
            console.log(`[Email] Email sent to ${to} via SMTP`);
            return;
        } catch (error) {
            console.error(`[Email Error] Failed to send email via SMTP:`, error);
        }
    }

    // Fallback: log to console
    console.log("\n==================================================");
    console.log(`[MOCK EMAIL SENT TO: ${to}]`);
    console.log(`Subject: ${subject}`);
    console.log("HTML Content:\n");
    console.log(html);
    console.log("==================================================\n");
};
