import "dotenv/config";
import app from "./express-app.js";
import { ServiceContainer } from './services/ServicesContainer.js';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("🚀 Starting AI Query Demo Server...\n");
    console.log("📦 Initializing services...");
     const serviceContainer = ServiceContainer.getInstance();
    await serviceContainer.initialize();
 
    const server = app.listen(PORT, () => {
      console.log("\n✅ Server started successfully!");
      console.log(`🌐 Server running at: http://localhost:${PORT}`);
      console.log("\n💡 Press Ctrl+C to stop the server\n");
    });
    const shutdown = async () => {
      console.log("\n\n🛑 Shutting down gracefully...");

      server.close(() => {
        console.log("✅ HTTP server closed");
      });

    /*   await serviceContainer.close(); */

      console.log("👋 Goodbye!\n");
      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (error) {
    console.error("\n❌ Failed to start server:", error);
    console.error(error instanceof Error ? error.stack : error);
    process.exit(1);
  }
}


startServer();