import { testRedisConnection } from "@/services/redis";
import { cleanOldJobs, closeQueues } from "@/lib/queue";
import cvProcessingWorker from "./cv-processor";
import cvAnalysisWorker from "./cv-analyzer";

// Track active workers
const workers = [cvProcessingWorker, cvAnalysisWorker];

// Start all workers
export async function startWorkers() {
  try {
    console.log("🚀 Starting CV processing workers...");

    // Test Redis connection first
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      throw new Error("Redis connection failed. Make sure Redis is running.");
    }

    // Clean old jobs on startup
    await cleanOldJobs();

    console.log("✅ All workers started successfully");
    console.log("👷 Workers running:");
    workers.forEach((worker) => {
      console.log(`  - ${worker.name} (concurrency: ${worker.concurrency})`);
    });

    return true;
  } catch (error) {
    console.error("❌ Failed to start workers:", error);
    throw error;
  }
}

// Stop all workers gracefully
export async function stopWorkers() {
  try {
    console.log("🛑 Stopping workers gracefully...");

    // Close all workers
    await Promise.all(workers.map((worker) => worker.close()));

    // Close queues
    await closeQueues();

    console.log("✅ All workers stopped successfully");
    return true;
  } catch (error) {
    console.error("❌ Error stopping workers:", error);
    throw error;
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT, shutting down gracefully...");
  await stopWorkers();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  await stopWorkers();
  process.exit(0);
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled promise rejection:", reason);
  // Don't exit the process, just log the error
});

// If this file is run directly, start the workers
if (require.main === module) {
  startWorkers().catch((error) => {
    console.error("❌ Failed to start workers:", error);
    process.exit(1);
  });
}
