import Redis from "ioredis";
import config from "./index.js";

// Configure Redis Client
export const redisClient = new Redis(config.redis_uri, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

redisClient.on("error", (err) => {
    console.error("Redis connection error:", err);
});

redisClient.on("connect", () => {
    console.log("Connected to Redis successfully.");
});
