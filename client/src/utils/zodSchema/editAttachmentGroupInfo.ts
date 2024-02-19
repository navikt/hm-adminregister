import z from "zod";

export const editAttachmentGroupInfoSchema = z.object({
  tittel: z.string().min(1, { message: "Tittel kan ikke være tom" }),
  beskrivelse: z.string(),
});
