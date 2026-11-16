import { phoneUtil } from 'utils/zodSchema/zod-utils.ts'
import z from 'zod'

export const editSupplierSchema = z.object({
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
        // Only http, https or no protocol
        const urlPattern = /^(https?:\/\/)?(www\.)?([^:/\s]+\.\S{2,})$/
        return urlPattern.test(value)
      },
      {
        message: 'Ugyldig format',
      }
    ),
  phone: phoneUtil,
  address: z.string(),
  postNr: z.string(),
  postLocation: z.string(),
})
