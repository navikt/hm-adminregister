import z from 'zod'

export const editAttachmentSchema = z.object({
  file: z.any(),
  title: z.string().min(1, { message: 'Tittel på dokument kan ikke være tom' }),
  beskrivelse: z.string(),
})

export type EditAttachmentFormData = z.infer<typeof editAttachmentSchema>

