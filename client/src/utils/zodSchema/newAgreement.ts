import z from 'zod'

export const createNewAgreementSchema = z.object({
  agreementName: z.string().min(1, { message: 'Navn på rammeavtale kan ikke være tom' }),
  avtaleperiodeStart: z.date({
    error: (issue) =>
      issue.input === undefined ? 'Avtaleperiodens sluttdato kan ikke være tom' : 'Dato er ikke gyldig',
  }),
  avtaleperiodeSlutt: z.date({
    error: (issue) =>
      issue.input === undefined ? 'Avtaleperiodens startdato kan ikke være tom' : 'Dato er ikke gyldig',
  }),
  anbudsnummer: z.string().min(1, { message: 'Anbudsnummer kan ikke være tomt' }),
})

export type createNewAgreementSchema = z.infer<typeof createNewAgreementSchema>
