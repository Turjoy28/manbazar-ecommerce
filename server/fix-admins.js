const mongoose = require('mongoose');

async function fixAdmins() {
    try {
        await mongoose.connect('mongodb+srv://menbazar:maD3Q8Qy6kHHkYrX@cluster0.5uujlwm.mongodb.net/menbazar?appName=Cluster0');
        console.log("Connected to MongoDB.");

        const Admin = mongoose.connection.db.collection('admins');

        // Update Super Admin
        const superAdmin = await Admin.findOne({ role: "ADMIN" });
        if (superAdmin) {
            await Admin.updateOne({ role: "ADMIN" }, { $set: { email: "okobizdev5@gmail.com" } });
            console.log("Super Admin email updated to okobizdev5@gmail.com");
        }

        // Update User Admin
        const userAdmin = await Admin.findOne({ role: "USER" });
        if (userAdmin) {
            await Admin.updateOne({ role: "USER" }, { $set: { email: "saifbus28@gmail.com" } });
            console.log("User Admin email updated to saifbus28@gmail.com");
        }
        
        console.log("Done!");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

fixAdmins();
