import { closeServices, getServices } from "../services/ServicesContainer.js";

async function testServices() {
    try {
        console.log("🧪 Testing Service Layer Implementation\n");

        // Initialize services
        console.log("📦 Initializing services...");
        const { databaseService } = await getServices();
        console.log("✅ Services initialized successfully\n");

       
        await closeServices();
    } catch (error) {
  console.error("❌ Test failed:", error);
    process.exit(1);
    }
}

testServices();