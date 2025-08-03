#!/usr/bin/env tsx

/**
 * Worker startup script
 *
 * This script starts the background workers for CV processing and analysis.
 * Run with: pnpm workers or node scripts/start-workers.ts
 */

import { startWorkers } from "../src/workers";

async function main() {
  try {
    console.log("🎯 CVeHak Workers - Starting Background Processing");
    console.log("================================================");

    await startWorkers();

    console.log("\n🎉 Workers are now running! Press Ctrl+C to stop.");
    console.log("📊 Monitor Redis: redis-cli monitor");
    console.log("📈 Check queues: redis-cli");

    // Keep the process alive
    process.stdin.resume();
  } catch (error) {
    console.error("💥 Failed to start workers:", error);
    process.exit(1);
  }
}

// Handle process signals
process.on("SIGINT", () => {
  console.log("\n👋 Goodbye!");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Goodbye!");
  process.exit(0);
});

main();
