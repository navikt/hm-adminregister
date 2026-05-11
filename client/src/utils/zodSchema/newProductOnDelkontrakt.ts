import z from 'zod'

export const createNewProductOnDelkontraktSchema = z.object({
  identifikator: z.string().min(1, { message: 'HMS-nummer/Levart nr. kan ikke være tomt' }),
})
