import { useState } from "react";
import { NewspaperIcon } from "@navikt/aksel-icons";
import { Box, Button, Heading, HStack, TextField, VStack } from "@navikt/ds-react";
import { labelRequired } from "utils/string-util";
import { useForm } from "react-hook-form";
import styles from "./CreateAndEditNews.module.scss";
import { CreateUpdateNewsDTO, NewsRegistrationDTO } from "utils/types/response-types";
import { createNews, updateNews } from "api/NewsApi";
import RichTextNewsEditor from "news/RichTextEditorNews";
import { useLocation, useNavigate } from "react-router-dom";
import { toDateTimeString } from "utils/date-util";
import CustomDatePicker from "news/CustomDatePicker";
import FormBox from "felleskomponenter/FormBox";

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
    const newNewsRelease: CreateUpdateNewsDTO = {
      title: data.newsTitle,
      text: textHtmlContent,
      published: toDateTimeString(data.publishedOn), //new Date(data.publishedOn).toISOString()
      expired: toDateTimeString(data.expiredOn),
    };

    if (editNewsData) {
      updateNews(newNewsRelease, editNewsData.id).then(() => {
        navigate("/nyheter");
      });
    } else {
      createNews(newNewsRelease).then(() => {
        navigate("/nyheter");
      });
    }
  }

  const title = editNewsData ? "Rediger nyhetsmelding" : "Opprett ny nyhetsmelding"

  return (
    <FormBox title={title} icon={<NewspaperIcon />}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="7">
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
          <Box>
            <Heading level="2" size="xsmall" spacing={true}>
              Vises på FinnHjelpemiddel
            </Heading>
            <HStack gap="4" wrap={false} align="start" justify="space-between">
              <CustomDatePicker
                name="publishedOn"
                label={"Fra"}
                control={control}
                required={true}
                shouldUnregister={true}
                errorMessage={"Ugyldig dato"}
              />

              <CustomDatePicker
                name="expiredOn"
                label={"Til"}
                control={control}
                required={true}
                shouldUnregister={true}
                errorMessage={"Ugyldig dato"}
                watchPublishDate={watch("publishedOn")}
              />
            </HStack>
          </Box>

          <Box>
            <Heading level="2" size="xsmall" spacing={true}>
              Beskrivelse
            </Heading>
            <RichTextNewsEditor
              onTextChange={setTextHtmlContent}
              defaultValue={editNewsData ? editNewsData.text : ""}
              className={styles.editorStyle}
            />
          </Box>
          <HStack gap="4" align="center">
            <Button type="reset" variant="secondary" size="medium" onClick={() => window.history.back()}>
              Avbryt
            </Button>

            <Button type="submit" size="medium">
              {editNewsData ? "Lagre" : "Opprett"}
            </Button>
          </HStack>
        </VStack>
      </form>
    </FormBox >
  );
};

export default CreateAndEditNews;
