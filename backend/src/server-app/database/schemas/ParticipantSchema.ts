import { EntitySchema } from "typeorm";
import type { Participant } from "@domain";

export const ParticipantSchema = new EntitySchema<Participant>({
  name: "Participant",
  tableName: "participants",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    firstName: {
      type: "varchar",
    },
    lastName: {
      type: "varchar",
    },
    documentNumber: {
      type: "varchar",
    },
    birthDate: {
      type: "date",
      nullable: true,
    },
    email: {
      type: "varchar",
      nullable: true,
    },
    phone: {
      type: "varchar",
      nullable: true,
    },
    isActive: {
      type: "boolean",
      default: true,
    },
    created_at: {
        type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});
