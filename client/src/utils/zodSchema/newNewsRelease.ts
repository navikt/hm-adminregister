import z from "zod";

export const newNewsVariantSchema = z.object({
    newsTitle: z.string().min(1, {
        message: "Du må oppgi en tittel på nyhetsmelding",
    }),
    publishedOn: z.date({
        required_error: "Avtaleperiodens sluttdato kan ikke være tom",
        invalid_type_error: "Dato er ikke gyldig",
    }),
    expiredOn: z.date({
        required_error: "Avtaleperiodens startdato kan ikke være tom",
        invalid_type_error: "Dato er ikke gyldig",
    }),
    newsText: z.string().min(1, { message: "Du må oppgi en beskrivelse" }),

});