import React from "react";
import {NewspaperIcon} from "@navikt/aksel-icons";
import {Button, Heading, HStack, DatePicker, Textarea, TextField} from "@navikt/ds-react";
import {labelRequired} from "utils/string-util";
import "./CreateNews.scss";
import {v4 as uuidv4} from "uuid"
import {NewsRegistrationDTO} from "utils/types/response-types";
import {z} from "zod";
import {newNewsVariantSchema} from "utils/zodSchema/Newnews";
import {createNews} from "api/NewsApi";

import styles from "./RichTextEditor.module.scss";
import {Editor} from "react-draft-wysiwyg";


type FormData = z.infer<typeof newNewsVariantSchema>;
const EditNews = () => {
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

  return (
      <div className="create-new-supplier">
        <div className="content">
          <div className="header-container">
            <NewspaperIcon title="a11y-title" width={43} height={43} aria-hidden/>
            <Heading level="1" size="large" align="center">
              Rediger nyhetsmelding
            </Heading>
          </div>
          <form >
            <TextField
                label={labelRequired("Tittel på nyhetsmelding")}
                id="newsTitle"
                name="newsTitle"
                type="text"
                autoComplete="on"

            />

            <Heading level="2" size="small" className="reducedSpacing">
              Vises på FinnHjelpemiddel
            </Heading>

            <DatePicker>
              <HStack gap="20" wrap={false}>
                <DatePicker.Input label="Fra"
                                  name="publishedOn"
                                  id="publishedOn"
                />
                <DatePicker.Input label="Til"
                                  name="expiredOn"
                                  id="expiredOn"
                />
              </HStack>
            </DatePicker>


            <Editor
                editorClassName ={styles.textField}
                toolbarClassName={styles.toolbar}
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