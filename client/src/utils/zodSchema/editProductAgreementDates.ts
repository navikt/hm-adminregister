import z from "zod";

export const editProductAgreementDatesSchema = z.object({
  published: z.date({
    required_error: "Tilknyttningens startdato kan ikke være tom",
    invalid_type_error: "Dato er ikke gyldig",
  }),
  expired: z.date({
    required_error: "Tilknyttningens sluttdato kan ikke være tom",
    invalid_type_error: "Dato er ikke gyldig",
  }),
});

export type EditProductAgreementDatesFormData = z.infer<typeof editProductAgreementDatesSchema>;

export type EditProductAgreementDatesFormDataDto = {
  published: string;
  expired: string;
};
