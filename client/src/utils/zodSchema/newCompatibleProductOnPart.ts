import z from "zod";

export const createNewCompatibleProductOnPartSchema = z.object({
  hmsLevartNummer: z.string().min(1, { message: "HMS-nummer/Levartnr kan ikke være tomt" }),
});
