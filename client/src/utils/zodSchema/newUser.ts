import z from "zod";

export const newUserSchema = z
  .object({
    name: z.string().min(5, { message: "Navn må inneholde minst 5 tegn." }),
    email: z
      .string()
      .min(6, { message: "Epostadressen må inneholde minst 6 tegn." })
      .email("Ikke riktig Email format enda"),
    roles: z.string().array(),
    password: z.string().min(8, { message: "Passord må inneholde minst 8 tegn." }),
    confirmPassword: z.string().min(8, { message: "Passord må inneholde minst 8 tegn." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passordene er ikke like",
  });

export type newUser = z.infer<typeof newUserSchema>;

export const newSupplierUserSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-postadresse er påkrevd" })
    .min(6, { message: "Epostadressen må inneholde minst 6 tegn." })
    .email("Ikke riktig Email format enda"),
  password: z
    .string()
    .min(1, { message: "Midlertidig passord er påkrevd" })
    .min(8, { message: "Passord må inneholde minst 8 tegn." }),
});

export type newSupplierUser = z.infer<typeof newSupplierUserSchema>;

export const newAdminUserSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-postadresse er påkrevd" })
    .min(6, { message: "Epostadressen må inneholde minst 6 tegn." })
    .email("Ikke riktig Email format enda"),
  password: z
    .string()
    .min(1, { message: "Midlertidig passord er påkrevd" })
    .min(8, { message: "Passord må inneholde minst 8 tegn." }),
});

export const newHmsUserSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-postadresse er påkrevd" })
    .min(6, { message: "Epostadressen må inneholde minst 6 tegn." })
    .email("Ikke riktig Email format enda"),
  password: z
    .string()
    .min(1, { message: "Midlertidig passord er påkrevd" })
    .min(8, { message: "Passord må inneholde minst 8 tegn." }),
});

export type newAdminUser = z.infer<typeof newSupplierUserSchema>;
