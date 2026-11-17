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
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return false
          }

          // Tillat IPv6 i brackets
          if (url.hostname.startsWith('[') && url.hostname.endsWith(']')) {
            return true
          }

          // Valider at det er et gyldig domenenavn
          const hostname = url.hostname.endsWith('.') ? url.hostname.slice(0, -1) : url.hostname
          const labels = hostname.split('.')
          return labels.length >= 2 && labels.every((label) => label.length > 0)
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
