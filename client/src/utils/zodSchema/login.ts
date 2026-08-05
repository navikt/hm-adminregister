import { phoneUtil } from 'utils/zodSchema/zod-utils.ts'
import z from 'zod'

export const loginSchema = z.object({
  username: z.email('Feil e-postformat'),
  password: z.string().min(8, 'Passord må inneholde minst 8 tegn.'),
})

export const userInfoUpdate = z
  .object({
    name: z.string().min(1, 'Du må fylle inn navn'),
    phone: z
      .string()
      .transform((value) => value.trim())
      .refine(
        (value) => {
          if (value === '') {
            return true
          }
          return /^[\d\s\-+]+$/.test(value.trim())

        },
        { message: 'Telefonnummer må være tall' }
      ),
    oldPassword: z.string().min(8, 'Passord må inneholde minst 8 tegn.'),
    newPassword: z.string().min(8, 'Passord må inneholde minst 8 tegn.'),
    confirmPassword: z.string().min(8, 'Passord må inneholde minst 8 tegn.'),
  })
  .superRefine(({ confirmPassword, newPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: 'custom',
        message: 'The passwords did not match',
      })
    }
  })

export const supplierInfoUpdate = z.object({
  homepage: z.string(),
  email: z.email(),
  phone: phoneUtil,
})

export const supplierUserInfoUpdate = z.object({
  name: z.string().min(1, 'Navn er påkrevd'),
  phone: phoneUtil,
})

export const adminInfoUpdate = z.object({
  name: z.string().min(1, 'Navn er påkrevd'),
  phone: phoneUtil,
})
