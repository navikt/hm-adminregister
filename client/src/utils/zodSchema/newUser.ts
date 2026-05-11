import z from 'zod'

export const newSupplierUserSchema = z.object({
  email: z
    .email('Ikke riktig Email format enda')
    .min(1, { message: 'E-postadresse er påkrevd' })
    .min(6, { message: 'Epostadressen må inneholde minst 6 tegn.' }),
  password: z
    .string()
    .min(1, { message: 'Midlertidig passord er påkrevd' })
    .min(8, { message: 'Passord må inneholde minst 8 tegn.' }),
})

export const newAdminUserSchema = z.object({
  email: z
    .email('Ikke riktig Email format enda')
    .min(1, { message: 'E-postadresse er påkrevd' })
    .min(6, { message: 'Epostadressen må inneholde minst 6 tegn.' }),
  password: z
    .string()
    .min(1, { message: 'Midlertidig passord er påkrevd' })
    .min(8, { message: 'Passord må inneholde minst 8 tegn.' }),
})

export const newHmsUserSchema = z.object({
  email: z
    .email('Ikke riktig Email format enda')
    .min(1, { message: 'E-postadresse er påkrevd' })
    .min(6, { message: 'Epostadressen må inneholde minst 6 tegn.' }),
  password: z
    .string()
    .min(1, { message: 'Midlertidig passord er påkrevd' })
    .min(8, { message: 'Passord må inneholde minst 8 tegn.' }),
})
