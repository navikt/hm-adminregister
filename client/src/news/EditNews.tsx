import React, {useEffect, useState} from "react";
import {NewspaperIcon} from "@navikt/aksel-icons";
import {
    Button,
    Heading,
    HStack,
    DatePicker,
    TextField,
    useDatepicker, Select
} from "@navikt/ds-react";
import {labelRequired} from "utils/string-util";
import "./CreateNews.scss";
import {NewsRegistrationDTO} from "utils/types/response-types";
import {updateNews} from "api/NewsApi";
import {useLocation, useNavigate} from "react-router-dom";
import {useForm} from "react-hook-form";
import RichTextEditorNews from "news/RichTextEditorNews";
import {calculateExpiredDate} from "./CreateNews"
import {toDate, toDateTimeString, toReadableDateTimeString, toReadableString} from "utils/date-util";
import {format} from "date-fns";

type FormData = {
    newsTitle: string;
    newsText: string;
    publishedOn: Date;
    expiredOn: Date;
    durationInMonths: string;
};

const EditNews = () => {
    const location = useLocation()
    const newsData = location.state as NewsRegistrationDTO;
    const navigate = useNavigate();

    const navigateEdit = () => {
        navigate("/nyheter");
    };


    const [contentText, setContent] = useState(
        newsData.text
    );

    const [contentDate, setContentDate ] = useState(toReadableString(newsData.published))


    const {
        handleSubmit,
        register,
        formState: {errors},
        setValue,
        unregister
    }
        = useForm<FormData>({
        mode: "onChange",
    });

    async function onSubmit(data: FormData) {
        const publishedDate = (contentDate === newsData.published)
                ? contentDate
                : format(contentDate, "yyyy-dd-MM'T'HH:mm:ss")
        const newNewsRelease: NewsRegistrationDTO = {
            id: newsData.id,
            title: data.newsTitle,
            text: contentText,
            published: publishedDate,
            expired: calculateExpiredDate(toDate(publishedDate), data.durationInMonths),
            // UNDER ARE TEMP VALS
            status: "ACTIVE",
            draftStatus: "DRAFT",
            created: newsData.created,
            updated: new Date(),
            author: "a",
            createdBy: "a",
            updatedBy: "a",
            createdByUser: "a",
            updatedByUser: "a",

        };
        updateNews(newNewsRelease).then(navigateEdit)
    }

    const {datepickerProps, inputProps} = useDatepicker({
        defaultSelected: new Date(newsData.published),
        onDateChange: (value) => {
            if (value) {
                setValue("publishedOn", value);
            } else {
                unregister("publishedOn");
            }

        }
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
                        error={errors.newsTitle && "Tittel er påkrevd"}
                        defaultValue={newsData.title}
                    />

                    <HStack paddingBlock="5 0" wrap={false} align='start' justify="space-between">
                        <DatePicker
                            {...datepickerProps}
                            onSelect={(val?) =>
                                (val) ? setContentDate(format(val,"dd.MM.yyyy")) : console.log("NEI!")}
                        >


                            <DatePicker.Input label={labelRequired("Synlig fra")}
                                              {...register("publishedOn", {required: true})}
                                              {...inputProps}
                                              name="publishedOn"
                                              id="publishedOn"
                                              value={contentDate}
                                              error={errors.publishedOn && "Publiseringsdato er påkrevd"}
                            />

                        </DatePicker>
                        <Select
                            {...register("durationInMonths")}
                            label="Varighet"
                        >
                            <option value="1">1 måned</option>
                            <option value="3">3 måneder</option>
                            <option value="5">5 måneder</option>
                        </Select>

                    </HStack>
                    <Heading level="2" size="small" className="reducedSpacing">
                        Beskrivelse
                    </Heading>
                    <div className="editorConteiner">
                        <RichTextEditorNews
                            content={contentText} setContent={setContent}/>
                    </div>

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