import z from "zod";

export const createNewDelkontraktSchema = z.object({
  tittel: z
    .string()
    .min(1, { message: "Tittel på delkontrakt kan ikke være tom" })
    .regex(RegExp("^[0-9]{1,2}[:.].*"), { message: "Tittel må starte med et tall etterfulgt av :  eller ." }),
  beskrivelse: z.string().min(1, { message: "Beskrivelse kan ikke være tom" }),
});
