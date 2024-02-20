import { zodResolver } from "@hookform/resolvers/zod";
import { Button, DatePicker, Heading, HStack, Label, Loader, TextField, useDatepicker, VStack } from "@navikt/ds-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React, { useState } from "react";
import { useHydratedErrorStore } from "utils/store/useErrorStore";
import { useNavigate } from "react-router-dom";
import { AgreementDraftWithDTO } from "utils/response-types";
import { labelRequired } from "utils/string-util";
import { useAuthStore } from "utils/store/useAuthStore";
import { createNewAgreementSchema } from "utils/zodSchema/newAgreement";
import { toDateTimeString } from "utils/date-util";
import { postAgreementDraft } from "api/AgreementApi";
import Content from "components/styledcomponents/Content";

type FormData = z.infer<typeof createNewAgreementSchema>;

export default function OpprettRammeavtale() {
  const { setGlobalError } = useHydratedErrorStore();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting, isDirty, isValid },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(createNewAgreementSchema),
    mode: "onSubmit",
  });
  const { loggedInUser } = useAuthStore();

  const { datepickerProps: datepickerPropsAvtaleperiodeStart, inputProps: inputPropsAvtaleperiodeStart } =
    useDatepicker({
      fromDate: undefined,
      onDateChange: (value) => {
        if (value) setValue("avtaleperiodeStart", value);
      },
    });

  const { datepickerProps: datepickerPropsAvtaleperiodeSlutt, inputProps: inputPropsAvtaleperiodeSlutt } =
    useDatepicker({
      fromDate: undefined,
      onDateChange: (value) => {
        if (value) setValue("avtaleperiodeSlutt", value);
      },
    });

  async function onSubmit(data: FormData) {
    setIsSaving(true);
    const newAgreement: AgreementDraftWithDTO = {
      title: data.agreementName,
      reference: data.anbudsnummer,
      expired: toDateTimeString(data.avtaleperiodeSlutt),
      published: toDateTimeString(data.avtaleperiodeStart),
    };

    postAgreementDraft(loggedInUser?.isAdmin || false, newAgreement)
      .then((agreement) => {
        setIsSaving(false);
        navigate(`/rammeavtaler/${agreement.id}`);
      })
      .catch((error) => {
        setIsSaving(false);
        setGlobalError(error.message);
      });
  }

  if (isSubmitting) {
    return <Loader size="3xlarge" title="Sender..."></Loader>;
  }

  return (
    <main>
      <Content>
        <VStack gap="8">
          <Heading level="1" size="large">
            Kom i gang med ny rammeavtale
          </Heading>
          <form className="form form--max-width-small" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register("agreementName", { required: true })}
              label={labelRequired("Avtalenavn")}
              id="agreementName"
              name="agreementName"
              type="text"
              error={errors?.agreementName?.message}
            />
            <div>
              <Label>Avtaleperiode</Label>
              <HStack gap="4" justify="space-between" style={{ marginTop: "0.5rem" }}>
                <DatePicker {...datepickerPropsAvtaleperiodeStart}>
                  <DatePicker.Input
                    {...inputPropsAvtaleperiodeStart}
                    label={labelRequired("Fra")}
                    id="avtaleperiodeStart"
                    name="avtaleperiodeStart"
                    error={errors?.avtaleperiodeStart?.message}
                  />
                </DatePicker>
                <DatePicker {...datepickerPropsAvtaleperiodeSlutt}>
                  <DatePicker.Input
                    {...inputPropsAvtaleperiodeSlutt}
                    label={labelRequired("Til")}
                    id="avtaleperiodeSlutt"
                    name="avtaleperiodeSlutt"
                    error={errors?.avtaleperiodeSlutt?.message}
                  />
                </DatePicker>
              </HStack>
            </div>
            <TextField
              {...register("anbudsnummer", { required: true })}
              label={labelRequired("Anbudsnummer")}
              id="anbudsnummer"
              name="anbudsnummer"
              type="text"
              error={errors?.anbudsnummer?.message}
            />
            <div className="button-container">
              <Button type="reset" variant="tertiary" size="medium" onClick={() => window.history.back()}>
                Avbryt
              </Button>
              <Button type="submit" size="medium" disabled={isSaving || isSubmitting || !isValid}>
                Opprett
              </Button>
            </div>
          </form>
        </VStack>
      </Content>
    </main>
  );
}
