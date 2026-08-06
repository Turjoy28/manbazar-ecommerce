import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Admin } from './src/models/admin.model.js';

dotenv.config();

async function checkAdmins() {
    try {
        await mongoose.connect(process.env.DATABASE_URI || "mongodb+srv://menbazar:maD3Q8Qy6kHHkYrX@cluster0.5uujlwm.mongodb.net/menbazar?appName=Cluster0");
        console.log("Connected to MongoDB.");

        const admins = await Admin.find({}).select('+password');
        console.log("ALL ADMINS IN DB:");
        admins.forEach(a => console.log(`Email: ${a.email}, Role: ${a.role}, PasswordHash: ${a.password}`));
        
        console.log("Done!");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

checkAdmins();
