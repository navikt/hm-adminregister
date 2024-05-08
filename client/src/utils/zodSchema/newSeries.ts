import z from "zod";

export const createNewSeriesSchema = z.object({
  isoCategory: z.string().min(1, { message: "Du må velge en isokategori" }),
  productName: z.string().min(1, { message: "Produktnavn kan ikke være tom" }),
});

export type createNewSeriesSchema = z.infer<typeof createNewSeriesSchema>;

export const commonSeriesInfo = z.object({
  isoCategory: z.string().min(1, { message: "Du må velge en isokategori" }),
  description: z.string().min(1, { message: "Beskrivelse kan ikke være tom" }),
});

export type commonSeriesInfo = z.infer<typeof commonSeriesInfo>;
