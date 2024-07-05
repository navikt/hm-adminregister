import React, {useState} from "react";
import {NewspaperIcon} from "@navikt/aksel-icons";
import {
    Button,
    Heading,
    HStack,
    DatePicker,
    TextField,
    Select,
    useDatepicker
} from "@navikt/ds-react";
import {labelRequired} from "utils/string-util";
import {useForm} from "react-hook-form";
import "./CreateNews.scss";
import {v4 as uuidv4} from "uuid"
import {NewsRegistrationDTO} from "utils/types/response-types";
import {createNews} from "api/NewsApi";
import RichTextEditorNews from "news/RichTextEditorNews";
import {useNavigate} from "react-router-dom";

type FormData = {
    newsTitle: string;
    newsText: string;
    publishedOn: Date;
    expiredOn: Date;
    duration: string;
};

export function calculateExpiredDate(publishedDate: Date, duration: {"type":string, "value":number}) {
    const endDate = new Date(publishedDate);
    if (duration.type == "month")
        endDate.setMonth(endDate.getMonth() + duration.value);
    else if (duration.type == "week"){
        endDate.setDate(endDate.getDate() + (7 * duration.value))
    }

    return endDate;
}

export function calcualteStatus(publishedDate : Date, duration : {"type":string, "value":number} ) {
    const toDay = new Date()
    const expiredDate = calculateExpiredDate(publishedDate, duration)
    if (publishedDate <= toDay && toDay <= expiredDate){
        return "ACTIVE"
    }
    else{
        return "INACTIVE"
    }
}


const CreateNews = () => {

    const navigate = useNavigate();
    const navigateEdit = () => {navigate("/nyheter")};

    const [content, setContent] = useState(
        ""
    );

    const {
        handleSubmit,
        register,
        formState: {errors},
        setValue,
        unregister
    }
        = useForm<FormData>({mode: "onChange"});


    async function onSubmit(data: FormData) {
        const newNewsRelease: NewsRegistrationDTO = {
            id: uuidv4(),
            title: data.newsTitle,
            text: content.replace("<p><br></p>", ""),
            published: data.publishedOn,
            expired: calculateExpiredDate(data.publishedOn, JSON.parse(data.duration)),
            // UNDER ARE TEMP VALS
            status: calcualteStatus(data.publishedOn, JSON.parse(data.duration)),
            draftStatus: "DRAFT",
            created: data.publishedOn,
            updated: data.publishedOn,
            author: "a",
            createdBy: "a",
            updatedBy: "a",
            createdByUser: "a",
            updatedByUser: "a",
        };
        createNews(newNewsRelease).then(navigateEdit)
    }

    const {datepickerProps, inputProps, selectedDay} = useDatepicker({
        fromDate: new Date(),
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
                        Opprett ny nyhetsmelding
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
                    />


                    <HStack paddingBlock="5 0" wrap={false} align='start' justify="space-between">
                        <DatePicker
                            {...datepickerProps}
                        >

                            <DatePicker.Input label={labelRequired("Synlig fra")}
                                              {...register("publishedOn", {required: true})}
                                              {...inputProps}
                                              name="publishedOn"
                                              id="publishedOn"
                                              error={errors.publishedOn && "Publiseringsdato er påkrevd"}
                            />

                        </DatePicker>
                        <Select
                            {...register("duration")}
                            label="Varighet"
                        >
                            <option value='{"type": "week", "value": 1}'>1 uke</option>
                            <option value='{"type": "week", "value": 2}'>2 uker</option>
                            <option value='{"type": "week", "value": 3}'>3 uker</option>
                            <option value='{"type": "month", "value": 1}'>1 måned</option>
                            <option value='{"type": "month", "value": 3}'>3 måneder</option>
                            <option value='{"type": "month", "value": 5}'>5 måneder</option>
                        </Select>

                    </HStack>
                    <Heading level="2" size="small" className="reducedSpacing">
                        Beskrivelse
                    </Heading>
                    <div className="editorConteiner">
                        <RichTextEditorNews content={content} setContent={setContent}/>
                    </div>
                    <div className="button-container">
                        <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
                            Avbryt
                        </Button>

                        <Button type="submit" size="medium">
                            Opprett
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default CreateNews