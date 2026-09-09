import Redis from "ioredis";
import config from "./index.js";

// Configure Redis Client
// retryStrategy: back off quickly in dev when Redis is unavailable; stops after 3 attempts
let redisErrorLogged = false;

export const redisClient = new Redis(config.redis_uri, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times) {
        if (times >= 3) {
            // Stop retrying – Redis is not available in this environment
            return null;
        }
        return Math.min(times * 500, 3000);
    },
});

redisClient.on("error", (err) => {
    if (!redisErrorLogged) {
        redisErrorLogged = true;
        const msg = (err as NodeJS.ErrnoException).code === "ECONNREFUSED"
            ? `Redis unavailable at ${config.redis_uri} – courier queue & token cache disabled. Start Redis to enable.`
            : String(err);
        console.warn("[Redis]", msg);
    }
});

redisClient.on("connect", () => {
    redisErrorLogged = false;
    console.log("[Redis] Connected successfully.");
});

// Attempt connection (non-blocking – failures are handled by retryStrategy above)
redisClient.connect().catch(() => {});
