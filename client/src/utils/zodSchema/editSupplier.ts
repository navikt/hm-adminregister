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
        if (/[\s\\]/.test(value) || value.startsWith('//')) {
          return false
        }
        const hasScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(value)
        try {
          const url = new URL(hasScheme ? value : `https://${value}`)
          if (!hasScheme && (url.username || url.password)) {
            return false
          }
          return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.')
        } catch (error) {
          if (error instanceof TypeError) {
            return false
          }
          throw error
        }
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
