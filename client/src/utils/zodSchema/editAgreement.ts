import z from 'zod'

export const editAgreementSchema = z.object({
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
  previousAgreement: z.uuid('Må være gyldig uuid').or(z.string().max(0)).nullable(),
})

export type EditAgreementFormData = z.infer<typeof editAgreementSchema>

export type EditAgreementFormDataDto = {
  agreementName: string
  avtaleperiodeStart: string
  avtaleperiodeSlutt: string
  anbudsnummer: string
  previousAgreement: string | null
}
