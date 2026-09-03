import { EntitySchema } from "typeorm";
import type { User } from "@domain";
import type { Location } from "express-validator";

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
      nullable: true,
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
    locationId: {
      type: "uuid",
      nullable: true,
    },
    
  },
  relations: {
    location: {
      type: "many-to-one",
      target: "Location",
      joinColumn: {
        name: "locationId",
      },
      nullable: true,
      onDelete: "SET NULL",
    },
  },

  indices: [
    {
      name: "IDX_USERS_LOCATION",
      columns: ["locationId"],
    },
  ],
  
});

