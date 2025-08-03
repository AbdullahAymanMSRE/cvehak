import Redis from "ioredis";

// Create Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

// Handle Redis connection events
redis.on("connect", () => {
  console.log("✅ Redis connected successfully");
});

redis.on("error", (error) => {
  console.error("❌ Redis connection error:", error);
});

redis.on("ready", () => {
  console.log("🚀 Redis is ready");
});

redis.on("close", () => {
  console.log("🔌 Redis connection closed");
});

// Test Redis connection
export async function testRedisConnection(): Promise<boolean> {
  try {
    await redis.ping();
    console.log("✅ Redis ping successful");
    return true;
  } catch (error) {
    console.error("❌ Redis ping failed:", error);
    return false;
  }
}

export default redis;
