import mongoose from 'mongoose';
import app from './app.js';
import config from './config/index.js';
import { seedAdmin } from './script/seedAdmin.js';


async function main() {
    try {
        if (!config.database_uri) {
            throw new Error('Database URL is not provided in environment variables');
        }

        await mongoose.connect(config.database_uri);
        console.log('Connected to MongoDB successfully');

        await seedAdmin();

        app.listen(config.port, () => {
            console.log(`Server is listening on port http://localhost:${config.port}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

main();