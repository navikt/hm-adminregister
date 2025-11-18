import z from "zod";

export const createNewDelkontraktSchema = z.object({
  tittel: z
    .string()
    .min(1, { message: "Tittel på delkontrakt kan ikke være tom" })
    .regex(/^[0-9]{1,2}[A-Za-z]?[:.].*/, {
      message:
        "Tittel må starte med et tall, eventuelt én bokstav, etterfulgt av : eller .",
    }),
  beskrivelse: z
    .string()
    .min(1, { message: "Beskrivelse kan ikke være tom" }),
});