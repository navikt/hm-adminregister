import z from 'zod'
import { newAdminUserSchema } from './newUser'

export const editProduktrangeringSchema = z.object({
  rangering: z.number()
    .min(1, { message: 'Rangering må være mellom 1 og 9' })
    .max(9, { message: 'Rangering må være mellom 1 og 9' }),
})

export type EditProduktrangeringFormData = z.infer<typeof editProduktrangeringSchema>