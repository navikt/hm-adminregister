import z from "zod";

export const newNewsVariantSchema = z.object({
    newsTitle: z.string().min(1, {
        message: "Du må oppgi en tittel på nyhetsmelding",
    }),
    publishedOn: z.string().min(1, { message: "Du må oppgi en startsdato" }),
    expiredOn: z.string().min(1, { message: "Du må oppgi en sluttdato" }),
    newsText: z.string().min(1, { message: "Du må oppgi en beskrivelse" }),

});