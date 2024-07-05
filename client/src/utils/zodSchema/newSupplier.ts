import z from "zod";

export const newSupplierSchema = z.object({
  name: z.string().min(2, { message: "Navn må inneholde minst 2 tegn" }),
  email: z
    .string()
    .transform((value) => value.trim()) // Trim whitespace
    .refine(
      (value) => {
        if (value === "") {
          return true;
        }
        const emailPattern = /^[\w\.-]+@[\w\.-]+\.\w+$/i;
        return emailPattern.test(value);
      },
      {
        message: "Ugyldig e-postformat",
      },
    ),
  homepage: z
    .string()
    .transform((value) => value.trim()) // Trim whitespace
    .refine(
      (value) => {
        if (value === "") {
          return true;
        }
        // Use a regular expression to check if the input resembles a URL with or without 'http://' or 'https://'.
        const urlPattern = /^(https?:\/\/)?(www\.\S+\.\S{2,})$/;
        return urlPattern.test(value);
      },
      {
        message: "Ugyldig format",
      },
    ),
  phone: z
    .string()
    .transform((value) => value.trim())
    .refine(
      (value) => {
        if (value === "") {
          return true;
        }
        return /^[+\d]+$/.test(value);
      },
      { message: "Telefonnummer må bestå av siffer" },
    ),
});

export type newSupplier = z.infer<typeof newSupplierSchema>;
