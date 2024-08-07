import z from "zod";

export const loginSchema = z.object({
  username: z.string().email("Feil e-postformat"),
  password: z.string().min(8, "Passord må inneholde minst 8 tegn."),
});

export const userInfoUpdate = z
  .object({
    name: z.string().min(1, "Du må fylle inn navn"),
    phone: z
      .string()
      .transform((value) => value.trim())
      .refine(
        (value) => {
          if (value === "") {
            return true;
          }
          return /^[+\s\d]+$/.test(value.trim());
        },
        { message: "Telefonnummer må være på +47 xxxxxxxx format" },
      ),
    oldPassword: z.string().min(8, "Passord må inneholde minst 8 tegn."),
    newPassword: z.string().min(8, "Passord må inneholde minst 8 tegn."),
    confirmPassword: z.string().min(8, "Passord må inneholde minst 8 tegn."),
  })
  .superRefine(({ confirmPassword, newPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "The passwords did not match",
      });
    }
  });

export const supplierInfoUpdate = z.object({
  // name: z.string(),
  homepage: z.string(),
  email: z.string().email(),
  phone: z
    .string()
    .transform((value) => value.trim())
    .refine(
      (value) => {
        if (value === "") {
          return true;
        }
        return /^[+\s\d]+$/.test(value.trim());
      },
      { message: "Telefonnummer må være på +47 xxxxxxxx format" },
    ),
});

export const supplierUserInfoUpdate = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  phone: z
    .string()
    .transform((value) => value.trim())
    .refine(
      (value) => {
        if (value === "") {
          return true;
        }
        return /^[+\s\d]+$/.test(value.trim());
      },
      { message: "Telefonnummer må være på +47 xxxxxxxx format" },
    ),
});

export const adminInfoUpdate = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  phone: z
    .string()
    .transform((value) => value.trim())
    .refine(
      (value) => {
        if (value === "") {
          return true;
        }
        return /^[+\s\d]+$/.test(value.trim());
      },
      { message: "Telefonnummer må være på +47 xxxxxxxx format" },
    ),
});
