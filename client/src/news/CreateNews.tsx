import React from "react";
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
import {RichTextEditor} from "produkter/RichTextEditor";
import {stateToHTML} from "draft-js-export-html";
import styles from "produkter/RichTextEditor.module.scss";
import {Editor} from "react-draft-wysiwyg";

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

  async function onSubmit(data: FormData) {
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
                editorClassName={styles.editor}
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

            <Textarea label={"Beskrivelse"}
                      resize
                      {...register("newsText", {required: true})}

                      className="increaseSpacing"
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