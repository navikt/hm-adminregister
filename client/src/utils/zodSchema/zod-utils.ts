import z from 'zod'

export const phoneUtil = z
  .string()
  .transform((value) => value.trim())
  .refine(
    (value) => {
      if (value === '') {
        return true
      }
      return /^[+\s\d]+$/.test(value.trim())
    },
    { message: 'Telefonnummer må være på +47 xxxxxxxx format' }
  )
