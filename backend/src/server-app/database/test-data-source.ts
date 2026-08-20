// backend/src/server-app/database/test-data-source.ts
import { DataSource } from "typeorm";
import { UserSchema } from "./schemas/UserSchema.js";
import { ParticipantSchema } from "./schemas/ParticipantSchema.js";
import { LocationSchema } from "./schemas/LocationSchema.js";
import { AttendanceSchema } from "./schemas/AttendanceSchema.js";

export const TestDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5433,         // ← puerto distinto al de desarrollo
  username: "cbj_test",
  password: "cbj_test_secret",
  database: "cbj_asistencia_test",
  synchronize: true,
  dropSchema: true,   // ← limpia TODO al iniciar cada corrida
  logging: false,
  entities: [UserSchema, ParticipantSchema, LocationSchema, AttendanceSchema],
});