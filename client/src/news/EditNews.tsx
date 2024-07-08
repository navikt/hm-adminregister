import { useState } from "react";
import { NewspaperIcon } from "@navikt/aksel-icons";
import { Button, DatePicker, Heading, HStack, Select, TextField, useDatepicker } from "@navikt/ds-react";
import { labelRequired } from "utils/string-util";
import "./CreateNews.module.scss";
import { NewsRegistrationDTO } from "utils/types/response-types";
import { updateNews } from "api/NewsApi";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import RichTextEditorNews from "news/RichTextEditorNews";
import { calculateExpiredDate, calculateStatus } from "./CreateNews";
import { toDateTimeString } from "utils/date-util";

type FormData = {
  newsTitle: string;
  newsText: string;
  publishedOn: Date;
  expiredOn: Date;
  duration: string;
};

const EditNews = () => {
  const location = useLocation();
  const newsData = location.state as NewsRegistrationDTO;
  const navigate = useNavigate();

  const navigateEdit = () => {
    navigate("/nyheter");
  };

  const [contentText, setContent] = useState(newsData.text);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    unregister,
  } = useForm<FormData>({
    mode: "onChange",
  });

  async function onSubmit(data: FormData) {
    const regex = /<ul>|(<li>|<p>|<ol>)<br>(<\/li>|<\/p>|<\/ol>)|<\/ul>/gm; // capture all p,li,ol,ul tags around <br>

    const newNewsRelease: NewsRegistrationDTO = {
      id: newsData.id,
      title: data.newsTitle,
      text: contentText.replace(regex, "<br>"),
      published: toDateTimeString(data.publishedOn),
      expired: toDateTimeString(calculateExpiredDate(data.publishedOn, JSON.parse(data.duration))),
      // UNDER ARE TEMP VALS
      status: calculateStatus(data.publishedOn, JSON.parse(data.duration)),
      draftStatus: "DRAFT",
      created: newsData.created,
      updated: toDateTimeString(new Date()),
      author: "a",
      createdBy: "a",
      updatedBy: "a",
      createdByUser: "a",
      updatedByUser: "a",
    };
    updateNews(newNewsRelease).then(navigateEdit);
  }

  const { datepickerProps, inputProps } = useDatepicker({
    defaultSelected: new Date(newsData.published),
    onDateChange: (value) => {
      if (value) {
        setValue("publishedOn", value);
      } else {
        unregister("publishedOn");
      }
    },
  });

  return (
    <div className="create-new-supplier">
      <div className="content">
        <div className="header-container">
          <NewspaperIcon title="a11y-title" width={43} height={43} aria-hidden />
          <Heading level="1" size="large" align="center">
            Rediger nyhetsmelding
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
            defaultValue={newsData.title}
          />

          <HStack paddingBlock="5 0" wrap={false} align="start" justify="space-between">
            <DatePicker {...datepickerProps}>
              <DatePicker.Input
                label={labelRequired("Synlig fra")}
                {...register("publishedOn", {
                  required: "Publiseringsdato er påkrevd",
                  pattern: {
                    value: /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/, //DD.MM.ÅÅÅÅ
                    message: "Ugyldig format (dd.mm.åååå)",
                  },
                })}
                {...inputProps}
                name="publishedOn"
                id="publishedOn"
                error={errors.publishedOn && errors.publishedOn.message?.toString()}
              />
            </DatePicker>
            <Select {...register("duration")} label="Varighet">
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
            <RichTextEditorNews content={contentText} setContent={setContent} />
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
  );
};

export default EditNews;
