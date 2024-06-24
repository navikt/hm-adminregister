import z from "zod";

export const newProductVariantSchema = z.object({
  articleName: z.string().min(1, {
    message: "Du må oppgi ett artikkelnavn som skiller denne fra andre varianter",
  }),
  supplierRef: z.string().min(1, { message: "Du må oppgi et leverandør artikkelnummer" }),
});
