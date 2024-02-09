import z from 'zod'

export const createNewDelkontraktSchema = z.object({
  tittel: z.string().min(1, { message: 'Tittel på delkontrakt kan ikke være tom' }),
  beskrivelse: z.string().min(1, { message: 'Beskrivelse kan ikke være tom' }),
})
