import { z } from "zod";

const locationSchema = z.object({
     id: z.string(),
     name: z.string(),
     address: z.string(),
     isActive: z.boolean()
})


export type Location = z.infer<typeof locationSchema>