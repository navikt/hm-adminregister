import z from 'zod'

export const createNewAgreementSchema = z.object({
  agreementName: z.string().min(1, { message: 'Navn på rammeavtale kan ikke være tom' }),
  avtaleperiodeStart: z.string().min(1, { message: 'Avtaleperiodens startdato kan ikke være tom' }),
  avtaleperiodeSlutt: z.string().min(1, { message: 'Avtaleperiodens sluttdato kan ikke være tom' }),
  anbudsnummer: z.string().min(1, { message: 'Anbudsnummer kan ikke være tomt' }),
})

export type createNewAgreementSchema = z.infer<typeof createNewAgreementSchema>
