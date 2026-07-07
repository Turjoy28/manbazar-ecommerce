import mongoose from "mongoose";
import { Admin } from "../src/models/admin.model.js";
import config from "../src/config/index.js";

async function run() {
    await mongoose.connect(config.database_uri || "mongodb://localhost:27017/menbazar");
    console.log("Connected to database");

    const users = await Admin.find().select("+password +onboardingToken");
    console.log("All Admins/Users in DB:");
    users.forEach(u => {
        console.log({
            id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            passwordSet: !!u.password,
            onboardingToken: u.onboardingToken,
            onboardingTokenUsed: (u as any).onboardingTokenUsed,
            onboardingTokenExpires: (u as any).onboardingTokenExpires,
        });
    });

    await mongoose.disconnect();
}

run().catch(console.error);
