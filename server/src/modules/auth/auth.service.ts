import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Admin } from "../../models/admin.model.js";
import config from "../../config/index.js";
import { sendEmail } from "../../utils/sendEmail.js";

/**
 * Authenticate admin with email and password.
 * Returns a signed JWT on success.
 */
const login = async (email: string, password: string) => {
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
        throw new Error("Invalid credentials");
    }

    // If password hasn't been set yet (onboarding pending)
    if (!admin.password) {
        throw new Error("Please complete your account setup via the onboarding link");
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    const secret = config.jwt_secret || config.secret;
    const token = jwt.sign(
        { id: admin._id, email: admin.email, role: admin.role },
        secret,
        { expiresIn: config.jwt_expires_in as jwt.SignOptions["expiresIn"] }
    );

    return { token, admin: { id: admin._id, email: admin.email, role: admin.role } };
};

/**
 * Invite a new Manager: create document and dispatch welcome email.
 */
const createManager = async (payload: { name: string; email: string }) => {
    const { name, email } = payload;
    const existing = await Admin.findOne({ email });
    if (existing) {
        throw new Error("User with this email already exists");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Generate random dummy password for backward compatibility/select rules
    const dummyPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);

    const manager = await Admin.create({
        name,
        email,
        role: "MANAGER",
        password: dummyPassword,
        onboardingToken: token,
        onboardingTokenExpires: expires,
        onboardingTokenUsed: false,
    });

    const setPasswordUrl = `${config.admin_url}/set-password?token=${token}`;

    const welcomeHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #e07b39; font-size: 24px; font-weight: bold; margin: 0;">Welcome to MenBazar</h1>
                <p style="color: #718096; font-size: 14px; margin: 4px 0 0 0;">Sub-Admin Onboarding Portal</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hello <strong>${name}</strong>,</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">You have been invited by the Administrator to join the MenBazar team as a <strong>Manager (Sub-Admin)</strong>. In this role, you will have access to manage products, pricing, inventory, and marketing banners.</p>
            
            <div style="background-color: #f7fafc; border-left: 4px solid #e07b39; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #4a5568;">
                    <strong>Security Notice:</strong> To finalize your account setup, please click the link below to configure your password. This link is secure, valid for <strong>24 hours</strong>, and can only be used once.
                </p>
            </div>
            
            <div style="text-align: center; margin-bottom: 24px;">
                <a href="${setPasswordUrl}" style="display: inline-block; padding: 12px 28px; background-color: #e07b39; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(224, 123, 57, 0.2); transition: background-color 0.2s;">
                    Set Up Your Password
                </a>
            </div>
            
            <p style="font-size: 14px; color: #718096; margin-bottom: 24px; line-height: 1.5;">
                If the button above does not work, copy and paste the following URL into your browser: <br/>
                <a href="${setPasswordUrl}" style="color: #e07b39; text-decoration: underline; word-break: break-all;">${setPasswordUrl}</a>
            </p>
            
            <hr style="border: 0; border-top: 1px solid #edf2f7; margin-bottom: 20px;" />
            
            <p style="font-size: 12px; color: #a0aec0; text-align: center; margin: 0;">
                This is an automated system notification. Please do not reply directly to this email.
            </p>
        </div>
    `;

    await sendEmail(email, "Welcome to MenBazar - Set Up Your Manager Account", welcomeHtml);

    return manager;
};

/**
 * Verify if onboarding token is valid and unexpired.
 */
const verifyOnboardingToken = async (token: string) => {
    // We must select +onboardingToken, +onboardingTokenExpires, +onboardingTokenUsed if they are configured select: false.
    const manager = await Admin.findOne({
        onboardingToken: token,
        onboardingTokenUsed: false,
        onboardingTokenExpires: { $gt: new Date() },
    });

    if (!manager) {
        throw new Error("Invitation link is invalid, expired, or has already been used");
    }

    return { email: manager.email, name: manager.name };
};

/**
 * Complete password setup and invalidate onboarding token.
 */
const setPassword = async (token: string, password: string) => {
    // Password complexity check
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!complexityRegex.test(password)) {
        throw new Error("Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
    }

    const manager = await Admin.findOne({
        onboardingToken: token,
        onboardingTokenUsed: false,
        onboardingTokenExpires: { $gt: new Date() },
    });

    if (!manager) {
        throw new Error("Invitation link is invalid, expired, or has already been used");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    manager.password = hashedPassword;
    manager.onboardingTokenUsed = true;
    await manager.save();

    return { email: manager.email, success: true };
};

/**
 * List all managers in the system.
 */
const listManagers = async () => {
    const managers = await Admin.find({ role: "MANAGER" }).sort({ createdAt: -1 });
    return managers;
};

/**
 * Forgot Password — Generate a 6-digit OTP, hash it, store it, and email it.
 */
const forgotPassword = async (email: string) => {
    const admin = await Admin.findOne({ email });
    if (!admin) {
        throw new Error("No account found with this email address");
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before storing (security best practice)
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Store with 10-minute expiry
    admin.resetOtp = hashedOtp;
    admin.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    admin.resetOtpUsed = false;
    await admin.save();

    // Send OTP email
    const otpHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #e07b39; font-size: 24px; font-weight: bold; margin: 0;">MenBazar</h1>
                <p style="color: #718096; font-size: 14px; margin: 4px 0 0 0;">Password Reset Request</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">Hello <strong>${admin.name || 'Admin'}</strong>,</p>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">We received a request to reset your password. Use the OTP below to verify your identity:</p>
            
            <div style="text-align: center; margin: 32px 0;">
                <div style="display: inline-block; padding: 16px 40px; background-color: #f7fafc; border: 2px dashed #e07b39; border-radius: 12px;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e07b39;">${otp}</span>
                </div>
            </div>
            
            <div style="background-color: #f7fafc; border-left: 4px solid #e07b39; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #4a5568;">
                    <strong>⏰ This OTP is valid for 10 minutes only.</strong><br/>
                    If you did not request a password reset, please ignore this email. Your account is safe.
                </p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #edf2f7; margin-bottom: 20px;" />
            
            <p style="font-size: 12px; color: #a0aec0; text-align: center; margin: 0;">
                This is an automated system notification. Please do not reply directly to this email.
            </p>
        </div>
    `;

    await sendEmail(email, "MenBazar — Password Reset OTP", otpHtml);

    return { email: admin.email, message: "OTP sent to your email" };
};

/**
 * Verify Reset OTP — Check if the provided OTP is valid.
 */
const verifyResetOtp = async (email: string, otp: string) => {
    const admin = await Admin.findOne({ email }).select("+resetOtp");

    if (!admin) {
        throw new Error("No account found with this email address");
    }

    if (!admin.resetOtp || admin.resetOtpUsed) {
        throw new Error("No active OTP found. Please request a new one.");
    }

    if (admin.resetOtpExpires && admin.resetOtpExpires < new Date()) {
        throw new Error("OTP has expired. Please request a new one.");
    }

    const isMatch = await bcrypt.compare(otp, admin.resetOtp);
    if (!isMatch) {
        throw new Error("Invalid OTP. Please check and try again.");
    }

    return { email: admin.email, verified: true };
};

/**
 * Reset Password — Verify OTP one final time and update the password.
 */
const resetPassword = async (email: string, otp: string, newPassword: string) => {
    // Password complexity check
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!complexityRegex.test(newPassword)) {
        throw new Error("Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
    }

    const admin = await Admin.findOne({ email }).select("+resetOtp");

    if (!admin) {
        throw new Error("No account found with this email address");
    }

    if (!admin.resetOtp || admin.resetOtpUsed) {
        throw new Error("No active OTP found. Please request a new one.");
    }

    if (admin.resetOtpExpires && admin.resetOtpExpires < new Date()) {
        throw new Error("OTP has expired. Please request a new one.");
    }

    const isMatch = await bcrypt.compare(otp, admin.resetOtp);
    if (!isMatch) {
        throw new Error("Invalid OTP. Please check and try again.");
    }

    // Update password and invalidate OTP
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    admin.resetOtpUsed = true;
    admin.resetOtp = undefined;
    await admin.save();

    return { email: admin.email, success: true };
};

export const authService = { login, createManager, verifyOnboardingToken, setPassword, listManagers, forgotPassword, verifyResetOtp, resetPassword };

