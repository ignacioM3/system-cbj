import { EntitySchema } from "typeorm";
import type { Location } from "@domain";

export const LocationSchema = new EntitySchema<Location>({
  name: "Location",
  tableName: "locations",
  columns: {
    id: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    name: {
      type: "varchar",
    },
    address: {
      type: "varchar",
    },
    isActive: {
      type: "boolean",
      default: true,
    },
  },
});
