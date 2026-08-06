import bcrypt  from 'bcryptjs';
import config from "../config";
import { Admin } from '../models/admin.model';

export const seedAdmin = async () => {
    try {
        // 1. Seed Super Admin
        if (config.admin_email && config.admin_password) {
            const adminExists = await Admin.findOne({ email: config.admin_email });
            const hashedAdminPassword = await bcrypt.hash(config.admin_password as string, 10);
            
            if (!adminExists) {
                await Admin.create({
                    email: config.admin_email,
                    password: hashedAdminPassword,
                    role: "ADMIN",
                });
                console.log("✅ Admin seeded successfully");
            } else {
                console.log("ℹ️ Admin already exists");
            }
        } else {
            console.log("❌ Missing config.admin_email or config.admin_password in configuration");
        }

        // 2. Seed Regular User
        if (config.user_email && config.user_password) {
            const userExists = await Admin.findOne({ email: config.user_email });
            if (!userExists) {
                const hashedUserPassword = await bcrypt.hash(config.user_password as string, 10);
                await Admin.create({
                    email: config.user_email,
                    password: hashedUserPassword,
                    role: "USER",
                });
                console.log("✅ User seeded successfully");
            } else {
                console.log("ℹ️ User already exists");
            }
        } else {
            console.log("❌ Missing config.user_email or config.user_password in configuration");
        }
    } catch (error) {
        console.log("❌ Seeding failed:", error);
    }
};