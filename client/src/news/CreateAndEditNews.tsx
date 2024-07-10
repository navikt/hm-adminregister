import { useState } from "react";
import { NewspaperIcon } from "@navikt/aksel-icons";
import { Button, Heading, HStack, TextField } from "@navikt/ds-react";
import { labelRequired } from "utils/string-util";
import { useForm } from "react-hook-form";
import styles from "./CreateNews.module.scss";
import { v4 as uuidv4 } from "uuid";
import { NewsRegistrationDTO } from "utils/types/response-types";
import { createNews, updateNews } from "api/NewsApi";
import RichTextEditorNews from "news/RichTextEditorNews";
import { useLocation, useNavigate } from "react-router-dom";
import { toDateTimeString } from "utils/date-util";
import CutsomDatePicker from "news/CutsomDatePicker";

type FormData = {
  newsTitle: string;
  newsText: string;
  publishedOn: Date;
  expiredOn: Date;
  duration: string;
};

const CreateAndEditNews = () => {
  const location = useLocation();
  const editNewsData = location.state as NewsRegistrationDTO;
  const navigate = useNavigate();
  const [textHtmlContent, setTextHtmlContent] = useState(editNewsData ? editNewsData.text : "");

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    unregister,
    control,
    watch,
  } = useForm<FormData>({
    mode: "onChange",
    defaultValues: {
      publishedOn: editNewsData ? new Date(editNewsData.published) : undefined,
      expiredOn: editNewsData ? new Date(editNewsData.expired) : undefined,
    },
  });

  async function onSubmit(data: FormData) {
    // capture all p,li,ol,ul tags around <br>
    const captureUnwantedGroup = /<ul>|(<li>|<p>|<ol>)<br>(<\/li>|<\/p>|<\/ol>)|<\/ul>/gm;

    const newNewsRelease: NewsRegistrationDTO = {
      id: editNewsData ? editNewsData.id : uuidv4(),
      title: data.newsTitle,
      text: editNewsData
        ? textHtmlContent.replace(captureUnwantedGroup, "<br>")
        : textHtmlContent.replace("<p><br></p>", ""),
      published: toDateTimeString(data.publishedOn), //new Date(data.publishedOn).toISOString()
      expired: toDateTimeString(data.expiredOn),
      // UNDER ARE VALS IGNORED BY BACKEND
      status: "ACTIVE",
      draftStatus: "DONE",
      created: editNewsData ? editNewsData.created : new Date().toISOString(),
      updated: new Date().toISOString(),
      author: "a",
      createdBy: "a",
      updatedBy: "a",
      createdByUser: "a",
      updatedByUser: "a",
    };

    const handleNews = editNewsData ? updateNews : createNews;

    handleNews(newNewsRelease).then(() => {
      navigate("/nyheter");
    });
  }

  return (
    <div className={styles.createNews}>
      <div className={styles.headerContainer}>
        <NewspaperIcon title="a11y-title" width={43} height={43} aria-hidden />
        <Heading level="1" size="large" align="center">
          {editNewsData ? "Rediger nyhetsmelding" : "Opprett ny nyhetsmelding"}
        </Heading>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register("newsTitle", { required: true })}
          label={labelRequired("Tittel på nyhetsmelding")}
          id="newsTitle"
          name="newsTitle"
          type="text"
          autoComplete="on"
          error={errors.newsTitle && "Tittel er påkrevd"}
          defaultValue={editNewsData ? editNewsData.title : ""}
        />

        <HStack paddingBlock="5 0" wrap={false} align="start" justify="space-between">
          <CutsomDatePicker
            name="publishedOn"
            label={"Synlig fra"}
            control={control}
            required={true}
            shouldUnregister={true}
            errorVedTomInput={"Ugyldig dato"}
          />
          <CutsomDatePicker
            name="expiredOn"
            label={"Synlig til"}
            control={control}
            required={true}
            shouldUnregister={true}
            errorVedTomInput={"Ugyldig dato"}
            watchDate={watch("publishedOn")}
          />
        </HStack>
        <Heading level="2" size="small" className={styles.increaseSpacing}>
          Beskrivelse
        </Heading>

        <RichTextEditorNews content={textHtmlContent} setContent={setTextHtmlContent} />

        <div className={styles.buttonContainer}>
          <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
            Avbryt
          </Button>

          <Button type="submit" size="medium">
            {editNewsData ? "Rediger" : "Opprett"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAndEditNews;
