import z from "zod";

export const editDelkontraktSchema = z.object({
  tittel: z.string().min(1, { message: "Tittel på delkontrakt kan ikke være tom" }),
  beskrivelse: z.string().min(1, { message: "Beskrivelse kan ikke være tom" }),
});

export type editAgreementSchema = z.infer<typeof editDelkontraktSchema>;
