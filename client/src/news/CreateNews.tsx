import React from "react";
import {NewspaperIcon} from "@navikt/aksel-icons";
import {Button, Heading, HStack, DatePicker, Textarea, TextField, useRangeDatepicker} from "@navikt/ds-react";
import {labelRequired} from "utils/string-util";
import {HM_REGISTER_URL} from "environments";
import {useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useErrorStore} from "utils/store/useErrorStore";
import "./CreateNews.scss";
import {v4 as uuidv4} from "uuid"
import { NewsRegistrationDTO} from "utils/types/response-types";
import {z} from "zod";
import {} from "utils/zodSchema/newProduct";
import {newNewsVariantSchema} from "utils/zodSchema/Newnews";
import {createNews} from "api/NewsApi";

type FormData = z.infer<typeof newNewsVariantSchema>;

const CreateNews = () => {
    const { setGlobalError } = useErrorStore();
    const {
        handleSubmit,
        register,
        formState: { errors, isSubmitting, isDirty, isValid },
    } = useForm<FormData>({
        resolver: zodResolver(newNewsVariantSchema),
        mode: "onChange",
    });

    async function onSubmit(data: FormData) {
        const newNewsRelease: NewsRegistrationDTO = {
            id : uuidv4(),
            title: data.newsTitle,
            text: data.newsText,
            published: data.publishedOn,
            expired: data.expiredOn,
            // UNDER ARE TEMP VALS
            status: "ACTIVE",
            draftStatus: "DRAFT",
            created: data.publishedOn,
            updated:  data.publishedOn,
            author: "a",
            createdBy: "a",
            updatedBy: "a",
            createdByUser: "a",
            updatedByUser:  "a",
        };
        createNews(newNewsRelease)
    }

    const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
        fromDate: new Date("Aug 23 2019"),
        onRangeChange: console.log,
    });

    return (
        <div className="create-new-supplier">
            <div className="content">
                <div className="header-container">
                    <NewspaperIcon title="a11y-title" width={43} height={43} aria-hidden/>
                    <Heading level="1" size="large" align="center">
                        Opprett ny nyhetsmelding
                    </Heading>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <TextField
                        {...register("newsTitle", {required: true})}
                        label={labelRequired("Tittel på nyhetsmelding")}
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="on"
                        error={errors.newsTitle && errors.newsTitle.message}
                    />

                    <Heading level="2" size="small" className="reducedSpacing">
                        Vises på FinnHjelpemiddel
                    </Heading>

                    <DatePicker
                        {...datepickerProps}

                    >
                        <HStack gap="20" wrap={false}>
                            <DatePicker.Input label="Fra"
                                              {...fromInputProps}
                                              {...register("publishedOn", {required: true})}
                                              error={errors.publishedOn && errors.publishedOn.message}
                            />
                            <DatePicker.Input label="Til"
                                              {...toInputProps}
                                              {...register("expiredOn", {required: true})}
                                              error={errors.expiredOn && errors.expiredOn.message}
                            />
                        </HStack>
                    </DatePicker>

                    <Textarea label={"Beskrivelse"}
                              resize
                              {...register("newsText", {required: true})}
                              error={errors.newsText && errors.newsText.message}
                              className="increaseSpacing"
                    >

                    </Textarea>


                    <div className="button-container">
                        <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
                            Avbryt
                        </Button>
                        <Button type="submit" size="medium" disabled={!isValid || isSubmitting }>
                            Opprett
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateNews