import React, {useState} from "react";
import {NewspaperIcon} from "@navikt/aksel-icons";
import {Button, Heading, HStack, DatePicker, Textarea, TextField, useRangeDatepicker} from "@navikt/ds-react";
import {labelRequired} from "utils/string-util";
import "./CreateNews.scss";
import {NewsRegistrationDTO} from "utils/types/response-types";
import {z} from "zod";
import {newNewsVariantSchema} from "utils/zodSchema/Newnews";
import {updateNews} from "api/NewsApi";
import {useLocation} from "react-router-dom";
import {useErrorStore} from "utils/store/useErrorStore";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";


type FormData = z.infer<typeof newNewsVariantSchema>;


const EditNews = () => {
    const location = useLocation()
    const newsData = location.state as NewsRegistrationDTO;

    const {setGlobalError} = useErrorStore();
    const {
        handleSubmit,
        register,
        formState: {errors, isSubmitting, isDirty, isValid},
        setValue,
        unregister
    } = useForm<FormData>({
        resolver: zodResolver(newNewsVariantSchema),
        mode: "onChange",
    });

    async function onSubmit(data: FormData) {
        const newNewsRelease: NewsRegistrationDTO = {
            id: newsData.id,
            title: data.newsTitle,
            text: data.newsText,
            published: data.publishedOn,
            expired: data.expiredOn,
            // UNDER ARE TEMP VALS
            status: "ACTIVE",
            draftStatus: "DRAFT",
            created: data.publishedOn,
            updated: data.publishedOn,
            author: "a",
            createdBy: "a",
            updatedBy: "a",
            createdByUser: "a",
            updatedByUser: "a",
        };
        await updateNews(newNewsRelease)
    }

    const {datepickerProps, toInputProps, fromInputProps} = useRangeDatepicker({
        defaultSelected: {from: new Date(newsData.published), to: new Date(newsData.expired)},
        onRangeChange: (value) => {
            if (value?.from) {
                setValue("publishedOn", value.from)
            } else {
                unregister("publishedOn")
            }
            if (value?.to) {
                setValue("expiredOn", value.to)
            } else {
                unregister("expiredOn")
            }
        },
    });
    return (
        <div className="create-new-supplier">
            <div className="content">
                <div className="header-container">
                    <NewspaperIcon title="a11y-title" width={43} height={43} aria-hidden/>
                    <Heading level="1" size="large" align="center">
                        Rediger nyhetsmelding
                    </Heading>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>

                    <TextField
                        {...register("newsTitle", {required: true})}
                        label={labelRequired("Tittel på nyhetsmelding")}
                        id="newsTitle"
                        name="newsTitle"
                        type="text"
                        autoComplete="on"
                        error={errors.newsTitle && errors.newsTitle.message}
                        defaultValue={newsData.title}

                    />

                    <Heading level="2" size="small" className="reducedSpacing">
                        Vises på FinnHjelpemiddel
                    </Heading>
                    <DatePicker
                        {...datepickerProps}
                    >
                        <HStack gap="20" wrap={false} align='start'>
                            <DatePicker.Input label="Fra"
                                              {...fromInputProps}
                                              {...register("publishedOn", {required: true})}
                                              name="publishedOn"
                                              id="publishedOn"
                                              error={errors.publishedOn && errors.publishedOn.message}


                            />
                            <DatePicker.Input label="Til"
                                              {...toInputProps}
                                              {...register("expiredOn", {required: true})}
                                              name="expiredOn"
                                              id="expiredOn"
                                              error={errors.expiredOn && errors.expiredOn.message}
                            />
                        </HStack>
                    </DatePicker>


                    <Textarea label={"Beskrivelse"}
                              resize
                              {...register("newsText", {required: true})}

                              className="increaseSpacing"
                              defaultValue={newsData.text}
                    >

                    </Textarea>


                    <div className="button-container">
                        <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
                            Avbryt
                        </Button>
                        <Button type="submit" size="medium">
                            Rediger
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditNews