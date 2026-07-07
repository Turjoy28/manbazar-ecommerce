import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    port: Number(process.env.PORT) || 5001,
    database_uri: process.env.DATABASE_URI || "",
    secret: process.env.JWT_SECRET || "",
    env: process.env.NODE_ENV || "development",
    admin_email: process.env.ADMIN_EMAIL,
    admin_password: process.env.ADMIN_PASSWORD,
    user_password: process.env.USER_PASSWORD,
    user_email: process.env.USER_EMAIL,
    jwt_secret: process.env.JWT_ACCESS_SECRET,
    jwt_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",

    // SMTP Configuration for Onboarding
    smtp: {
        host: process.env.SMTP_HOST || "",
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || "",
        from: process.env.SMTP_FROM || "no-reply@manbazar.com",
    },
    admin_url: process.env.ADMIN_URL || "http://localhost:3003",

    // Courier API Credentials
    steadfast: {
        api_key: process.env.STEADFAST_API_KEY || "",
        api_secret: process.env.STEADFAST_API_SECRET || "",
    },
    pathao: {
        client_id: process.env.PATHAO_CLIENT_ID || "",
        client_secret: process.env.PATHAO_CLIENT_SECRET || "",
        username: process.env.PATHAO_USERNAME || "",
        password: process.env.PATHAO_PASSWORD || "",
        store_id: process.env.PATHAO_STORE_ID || "",
    },
    redx: {
        api_key: process.env.REDX_API_KEY || "",
    }
};
