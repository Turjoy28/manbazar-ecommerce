import nodemailer from "nodemailer";
import config from "../config/index.js";

/**
 * Utility to send email.
 * Falls back to console log printing if SMTP configs are missing.
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
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

            await transporter.sendMail({
                from: from || "no-reply@manbazar.com",
                to,
                subject,
                html,
            });
            console.log(`[Email] Onboarding email sent to ${to} via SMTP`);
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
