import z from "zod";
import type { Location } from "./Location";

const participantSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  documentNumber: z.string(),
  email: z.string().email().optional(),
  birthDate: z.date().optional(),
  phone: z.string().optional(),
  isActive: z.boolean(),
  locationId: z.string(),
  created_at: z.date(),
});


export type ParticipantWithRelation = Participant & {
    location?: Location
}

export type Participant = z.infer<typeof participantSchema>;
export type CreateParticipantForm = Omit<Participant, "id" | "isActive" | "created_at">;
export type UpdateParticipantData = Partial<
  Omit<CreateParticipantForm, "locationId">
> & {
  participantId: string;
};