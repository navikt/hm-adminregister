import React, {useState} from "react";
import {NewspaperIcon} from "@navikt/aksel-icons";
import {Button, Heading, HStack, DatePicker, Textarea, TextField, useRangeDatepicker} from "@navikt/ds-react";
import {labelRequired} from "utils/string-util";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useErrorStore} from "utils/store/useErrorStore";
import "./CreateNews.scss";
import {v4 as uuidv4} from "uuid"
import {NewsRegistrationDTO} from "utils/types/response-types";
import {z} from "zod";
import {} from "utils/zodSchema/newProduct";
import {newNewsVariantSchema} from "utils/zodSchema/Newnews";
import {createNews} from "api/NewsApi";
import {Editor} from "react-draft-wysiwyg";
import { EditorState,} from 'draft-js';
import {stateFromHTML} from "draft-js-import-html";
import {stateToHTML} from "draft-js-export-html";

type FormData = z.infer<typeof newNewsVariantSchema>;

const CreateNews = () => {
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

  const [updatedDescription, setUpdatedDescription] = useState<string>("");
  const [state, setState] = useState<EditorState>(EditorState.createWithContent(stateFromHTML(updatedDescription)));

  async function onSubmit(data: FormData) {
    console.log("ett eller annet")
    const newNewsRelease: NewsRegistrationDTO = {
      id: uuidv4(),
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
    createNews(newNewsRelease)
  }

  const {datepickerProps, toInputProps, fromInputProps} = useRangeDatepicker({
    fromDate: new Date(),
    onRangeChange: (value) => {
    if (value?.from) {
      setValue("publishedOn",value.from)
    }
    else{
      unregister("publishedOn")
    }
    if (value?.to) {
        setValue("expiredOn",value.to)
      }
      else{
        unregister("expiredOn")
      }
    },
  });
  console.log(updatedDescription)

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
                                  name="publishedOn"
                                  id="publishedOn"
                                  error={errors.publishedOn && errors.publishedOn.message}
                />
                <DatePicker.Input label="Til"
                                  {...toInputProps}
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
                }}
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
            <Textarea label={""}
                      className="hiddenText"
                      {...register("newsText", {required: true})}
                value = {updatedDescription}
            >
            </Textarea>
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