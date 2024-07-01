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
import {Editor} from "react-draft-wysiwyg";
import {stateToHTML} from "draft-js-export-html";
import {EditorState} from "draft-js";
import {stateFromHTML} from "draft-js-import-html";


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

    const [updatedDescription, setUpdatedDescription] = useState<string>(newsData.text);
    const [state, setState] = useState<EditorState>(EditorState.createWithContent(stateFromHTML(updatedDescription)));

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

                    <Editor
                        editorState={state}
                        onEditorStateChange={(editorState) => {
                            setState(editorState);
                            const html = stateToHTML(editorState.getCurrentContent());
                            setUpdatedDescription(html);
                            setValue("newsText",html)
                        }}
                        ariaDescribedBy="newsText-editor-error"
                        wrapperClassName="wrapper"
                        editorClassName="editor"
                        toolbarClassName="toolbar"
                        toolbar={{
                            options: ["inline", "list"],
                            inline: {
                                inDropdown: false,
                                options: ["bold", "italic"],
                            },
                            list: {
                                inDropdown: false,
                                options: ["unordered", "ordered"],
                            },
                        }}

                    />
                    {errors.newsText && <div id="newsText-editor-error" className="navds-form-field__error navds-error-message ">
                        <p className="navds-error-message">
                            {
                                errors.newsText.message
                            }
                        </p>
                    </div> }

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