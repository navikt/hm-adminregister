import z from "zod";

export const createNewProductOnDelkontraktSchema = z.object({
  hmsNummer: z.string().min(1, { message: "HMS-nummer kan ikke være tomt" }),
});

export type createNewDelkontraktSchema = z.infer<typeof createNewProductOnDelkontraktSchema>;
