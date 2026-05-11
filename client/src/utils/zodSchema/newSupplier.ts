import z from 'zod'

export const newSupplierSchema = z.object({
  name: z.string().min(1, { message: 'Firmanavn er påkrevd' }).min(2, { message: 'Navn må inneholde minst 2 tegn' }),
  email: z.email('Ugyldig e-postformat').transform((value) => value.trim()),
  homepage: z
    .string()
    .transform((value) => value.trim()) // Trim whitespace
    .refine(
      (value) => {
        if (value === '') {
          return true
        }
        // Use a regular expression to check if the input resembles a URL with or without 'http://' or 'https://'.
        const urlPattern = /^(https?:\/\/)(www\.)?(\S+\.\S{2,})$/
        return urlPattern.test(value)
      },
      {
        message: 'Ugyldig format',
      }
    ),
  phone: z
    .string()
    .transform((value) => value.trim())
    .refine(
      (value) => {
        if (value === '') {
          return true
        }
        return /^[+\d]+$/.test(value)
      },
      { message: 'Telefonnummer må bestå av siffer' }
    ),
})

type newSupplier = z.infer<typeof newSupplierSchema>
