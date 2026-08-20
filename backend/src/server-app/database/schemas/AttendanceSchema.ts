import { EntitySchema } from "typeorm";
import type { Attendance } from "@domain";

export const AttendanceSchema = new EntitySchema<Attendance>({
  name: "Attendance",
  tableName: "attendances",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    participantId: {
      type: "uuid",
    },
    locationId: {
      type: "uuid",
    },
    date: {
      type: "date",
    },
    time: {
      type: "time",
    },
    isActive: {
      type: "boolean",
      default: true,
    },
    registeredBy: {
      type: "uuid",
      nullable: true,
    },
  },
});
