import z from 'zod'

export const createNewAgreementSchema = z.object({
  agreementName: z.string().min(1, { message: 'Navn på rammeavtale kan ikke være tom' }),
  avtaleperiodeStart: z.date(),
  avtaleperiodeSlutt: z.date(),
  anbudsnummer: z.string().min(1, { message: 'Anbudsnummer kan ikke være tomt' }),
})

export type createNewAgreementSchema = z.infer<typeof createNewAgreementSchema>
