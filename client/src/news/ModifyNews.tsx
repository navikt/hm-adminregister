import React, { useState } from "react";
import { NewspaperIcon } from "@navikt/aksel-icons";
import { Button, DatePicker, Heading, HStack, Select, TextField, useDatepicker } from "@navikt/ds-react";
import { labelRequired } from "utils/string-util";
import { useForm } from "react-hook-form";
import styles from "./CreateNews.module.scss";
import { v4 as uuidv4 } from "uuid";
import { NewsRegistrationDTO } from "utils/types/response-types";
import { createNews, updateNews } from "api/NewsApi";
import RichTextEditorNews from "news/RichTextEditorNews";
import { useLocation, useNavigate } from "react-router-dom";
import { toDate } from "utils/date-util";
import { format } from "date-fns";

type FormData = {
  newsTitle: string;
  newsText: string;
  publishedOn: Date;
  expiredOn: Date;
  duration: string;
};

// Only used for edit days
function changeMonthAndDay(date: string): string {
  const [day, month, year] = date.split(".");
  return `${month}.${day}.${year}`;
}

export function calculateExpiredDate(publishedDate: Date, duration: { type: string; value: number }) {
  const endDate = new Date(publishedDate);
  if (duration.type == "month") endDate.setMonth(endDate.getMonth() + duration.value);
  else if (duration.type == "week") {
    endDate.setDate(endDate.getDate() + 7 * duration.value);
  }

  return endDate;
}

export function calculateStatus(publishedDate: Date, duration: { type: string; value: number }) {
  const toDay = new Date();
  const expiredDate = calculateExpiredDate(publishedDate, duration);
  if (publishedDate <= toDay && toDay <= expiredDate) {
    return "ACTIVE";
  } else {
    return "INACTIVE";
  }
}

const ModifyNews = () => {
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
  } = useForm<FormData>({ mode: "onChange" });

  async function onSubmit(data: FormData) {
    const regex = /<ul>|(<li>|<p>|<ol>)<br>(<\/li>|<\/p>|<\/ol>)|<\/ul>/gm; // capture all p,li,ol,ul tags around <br>

    const publishedDate =
      data.publishedOn.toString().length == "dd.mm.yyyy".length //Check if the date is not updated by the datepicker
        ? toDate(format(changeMonthAndDay(data.publishedOn.toString()), "yyyy-MM-dd'T'HH:mm:ss")) //the date is handled as "mm.dd.yyyy" as the formatter, therfore we change it to "dd.mm.yyyy"
        : data.publishedOn;

    const newNewsRelease: NewsRegistrationDTO = {
      id: editNewsData ? editNewsData.id : uuidv4(),
      title: data.newsTitle,
      text: editNewsData ? textHtmlContent.replace(regex, "<br>") : textHtmlContent.replace("<p><br></p>", ""),
      published: publishedDate.toISOString(),
      expired: calculateExpiredDate(publishedDate, JSON.parse(data.duration)).toISOString(),
      // UNDER ARE TEMP VALS
      status: calculateStatus(publishedDate, JSON.parse(data.duration)),
      draftStatus: "DRAFT",
      created: editNewsData ? editNewsData.created : new Date().toISOString(),
      updated: new Date().toISOString(),
      author: "a",
      createdBy: "a",
      updatedBy: "a",
      createdByUser: "a",
      updatedByUser: "a",
    };

    if (editNewsData) {
      updateNews(newNewsRelease).then(() => {
        navigate("/nyheter");
      });
    } else {
      createNews(newNewsRelease).then(() => {
        navigate("/nyheter");
      });
    }
  }

  const { datepickerProps, inputProps } = useDatepicker({
    fromDate: editNewsData ? undefined : new Date(),
    defaultSelected: editNewsData ? new Date(editNewsData.published) : undefined,
    onDateChange: (value) => {
      if (value) {
        setValue("publishedOn", value);
      } else {
        unregister("publishedOn");
      }
    },
  });

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
        <Heading level="2" size="small" className={styles.reducedSpacing}>
          Beskrivelse
        </Heading>
        <div>
          <RichTextEditorNews content={textHtmlContent} setContent={setTextHtmlContent} />
        </div>

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

export default ModifyNews;
