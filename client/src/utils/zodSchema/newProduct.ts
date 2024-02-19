import z from "zod";

export const createNewProductSchema = z.object({
  isoCategory: z.string().min(1, { message: "Du må velge en isokategori" }),
  productName: z.string().min(1, { message: "Produktnavn kan ikke være tom" }),
});

export type createNewProductSchema = z.infer<typeof createNewProductSchema>;

export const commonProductInfo = z.object({
  isoCategory: z.string().min(1, { message: "Du må velge en isokategori" }),
  description: z.string().min(1, { message: "Beskrivelse kan ikke være tom" }),
});

export type commonProductInfo = z.infer<typeof commonProductInfo>;

export const newProductVariantSchema = z.object({
  articleName: z.string().min(1, {
    message: "Du må oppgi ett artikkelnavn som skiller denne fra andre varianter",
  }),
  supplierRef: z.string().min(1, { message: "Du må oppgi et leverandør artikkelnummer" }),
});

export const productVariantSchema = z.object({
  articleName: z.string().min(1, {
    message: "Du må oppgi ett artikkelnavn som skiller denne fra andre varianter",
  }),
  supplierRef: z.string().min(1, { message: "Du må oppgi et leverandør artikkelnummer" }),
  hmsArtNr: z.string(),
  techData: z.array(z.object({ key: z.string(), value: z.string(), unit: z.string() })),
});
