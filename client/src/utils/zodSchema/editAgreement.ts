import z from "zod";

export const editAgreementSchema = z.object({
  agreementName: z.string().min(1, { message: "Navn på rammeavtale kan ikke være tom" }),
  avtaleperiodeStart: z.date({
    required_error: "Avtaleperiodens sluttdato kan ikke være tom",
    invalid_type_error: "Dato er ikke gyldig",
  }),
  avtaleperiodeSlutt: z.date({
    required_error: "Avtaleperiodens startdato kan ikke være tom",
    invalid_type_error: "Dato er ikke gyldig",
  }),
  anbudsnummer: z.string().min(1, { message: "Anbudsnummer kan ikke være tomt" }),
});

export type EditAgreementFormData = z.infer<typeof editAgreementSchema>;

export type EditAgreementFormDataDto = {
  agreementName: string;
  avtaleperiodeStart: string;
  avtaleperiodeSlutt: string;
  anbudsnummer: string;
};
