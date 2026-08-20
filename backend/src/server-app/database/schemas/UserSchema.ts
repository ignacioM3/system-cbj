import { EntitySchema } from "typeorm";
import type { User } from "@domain";

export const UserSchema = new EntitySchema<User>({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    email: {
      type: "varchar",
      unique: true,
    },
    phone: {
        type: "varchar",
        nullable: true,
    },
    password: {
      type: "varchar",
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
    isActive: {
      type: "boolean",
      default: true,
    },
    role: {
      type: "varchar",
      
    },
  },
});
