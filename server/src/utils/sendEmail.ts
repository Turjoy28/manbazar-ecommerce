import nodemailer from "nodemailer";
import config from "../config/index.js";

/**
 * Utility to send email.
 * Includes anti-spam best practices: plain-text fallback, proper headers, reply-to.
 * Falls back to console log printing if SMTP configs are missing.
 */
export const sendEmail = async (to: string, subject: string, html: string, plainText?: string) => {
    const { host, port, user, pass, from } = (config as any).smtp || {};

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
