import z from 'zod'

const editProductAgreementDatesSchema = z.object({
  published: z.date({
    error: (issue) =>
      issue.input === undefined ? 'Tilknyttningens startdato kan ikke være tom' : 'Dato er ikke gyldig',
  }),
  expired: z.date({
    error: (issue) =>
      issue.input === undefined ? 'Tilknyttningens sluttdato kan ikke være tom' : 'Dato er ikke gyldig',
  }),
})

type EditProductAgreementDatesFormData = z.infer<typeof editProductAgreementDatesSchema>

export type EditProductAgreementDatesFormDataDto = {
  published: string
  expired: string
}
