import z from 'zod'

export const createNewAgreementSchema = z.object({
  agreementName: z.string().min(1, { message: 'Navn på rammeavtale kan ikke være tom' }),
  avtaleperiodeStart: z.date({
    required_error: 'Avtaleperiodens sluttdato kan ikke være tom',
    invalid_type_error: 'Dato er ikke gyldig',
  }),
  avtaleperiodeSlutt: z.date({
    required_error: 'Avtaleperiodens startdato kan ikke være tom',
    invalid_type_error: 'Dato er ikke gyldig',
  }),
  anbudsnummer: z.string().min(1, { message: 'Anbudsnummer kan ikke være tomt' }),
})

export type createNewAgreementSchema = z.infer<typeof createNewAgreementSchema>
