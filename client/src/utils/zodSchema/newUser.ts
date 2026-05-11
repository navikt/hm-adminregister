import z from 'zod'

const newUserSchema = z
  .object({
    name: z.string().min(5, { message: 'Navn må inneholde minst 5 tegn.' }),
    email: z.email('Ikke riktig Email format enda').min(6, { message: 'Epostadressen må inneholde minst 6 tegn.' }),
    roles: z.string().array(),
    password: z.string().min(8, { message: 'Passord må inneholde minst 8 tegn.' }),
    confirmPassword: z.string().min(8, { message: 'Passord må inneholde minst 8 tegn.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passordene er ikke like',
  })

type newUser = z.infer<typeof newUserSchema>

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

type newSupplierUser = z.infer<typeof newSupplierUserSchema>

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

type newAdminUser = z.infer<typeof newSupplierUserSchema>
