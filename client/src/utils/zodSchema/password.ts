import z from 'zod'

export const passwordChangeSchema = z
  .object({
    oldPassword: z.string().min(8, { message: 'Passord må inneholde minst 8 tegn.' }),
    newPassword: z.string().min(8, { message: 'Passord må inneholde minst 8 tegn.' }),
    confirmPassword: z.string().min(8, { message: 'Passord må inneholde minst 8 tegn.' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Begge passord bør være like',
    path: ['confirmPassword'], // Set the path of this error on the confirmEmail field.
  })
