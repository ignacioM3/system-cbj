import { DataSource } from "typeorm";
import { UserSchema } from "./schemas/UserSchema.js";
import { AttendanceSchema } from "./schemas/AttendanceSchema.js";
import { LocationSchema } from "./schemas/LocationSchema.js";
import { ParticipantSchema } from "./schemas/ParticipantSchema.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "cbj",
  password: process.env.DB_PASSWORD || "cbj_secret_2026",
  database: process.env.DB_NAME || "cbj_asistencia",
  synchronize: true, 
  logging: false,
  entities: [UserSchema, ParticipantSchema, LocationSchema, AttendanceSchema],
});

export async function InitializeDatabase(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connection established successfully");
    }
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw new Error(
      `Failed to initialize database: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
