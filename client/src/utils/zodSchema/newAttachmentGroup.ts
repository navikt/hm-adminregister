import z from "zod";

export const createNewAttachmentGroupSchema = z.object({
  tittel: z.string().min(1, { message: "Tittel kan ikke være tom" }),
  beskrivelse: z.string().min(1, { message: "Beskrivelse kan ikke være tom" }),
});
