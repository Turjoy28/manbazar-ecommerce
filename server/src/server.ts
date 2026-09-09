import dns from 'dns';
import mongoose from 'mongoose';
import app from './app.js';
import config from './config/index.js';
import { seedAdmin } from './script/seedAdmin.js';
import { seedUi } from './script/seedUi.js';
import { seedCategories } from './script/seedCategories.js';

import { socketService } from './modules/socket/socket.service.js';
import './modules/courier/courier.worker.js';

// Resolve MongoDB SRV records reliably on Windows/IPv6 networks
try {
    dns.setDefaultResultOrder('ipv4first');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
    // Keep defaults if custom DNS setting is not supported
}

async function main() {
    try {
        if (!config.database_uri) {
            throw new Error('Database URL is not provided in environment variables');
        }

        await mongoose.connect(config.database_uri);
        console.log('Connected to MongoDB successfully');

        await seedAdmin();
        await seedUi();
        await seedCategories();

        const server = app.listen(config.port, () => {
            console.log(`Server is listening on port http://localhost:${config.port}`);
        });

        server.on('error', (err: any) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`[Server] Port ${config.port} is already in use by another process. Please close existing instance.`);
            } else {
                console.error('[Server] HTTP server error:', err);
            }
            process.exit(1);
        });

        // Initialize Real-Time WebSockets
        socketService.init(server);
    } catch (err) {
        console.error('[Server] Fatal startup error:', err);
        process.exit(1);
    }
}

main();