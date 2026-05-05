import { Button, DatePicker, HStack, Label, Loader, Modal, TextField, useDatepicker, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useErrorStore } from "utils/store/useErrorStore";
import { EditAgreementFormData, EditAgreementFormDataDto, editAgreementSchema } from "utils/zodSchema/editAgreement";
import { updateAgreementInfo } from "api/AgreementApi";
import { AgreementRegistrationDTO } from "utils/types/response-types";
import { labelRequired } from "utils/string-util";
import { mergeDateWithTime, toDate, toDateTimeString, toTimeString } from "utils/date-util";
import Content from "felleskomponenter/styledcomponents/Content";

interface Props {
  modalIsOpen: boolean;
  agreement: AgreementRegistrationDTO;
  setModalIsOpen: (open: boolean) => void;
  mutateAgreement: () => void;
}

const EditAgreementInfoModal = ({ modalIsOpen, agreement, setModalIsOpen, mutateAgreement }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [avtaleperiodeStartTid, setAvtaleperiodeStartTid] = useState<string>(toTimeString(toDate(agreement.published)));
  const [avtaleperiodeSluttTid, setAvtaleperiodeSluttTid] = useState<string>(toTimeString(toDate(agreement.expired)));

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<EditAgreementFormData>({
    resolver: zodResolver(editAgreementSchema),
    mode: "onSubmit",
    defaultValues: {
      agreementName: agreement?.title,
      anbudsnummer: agreement?.reference,
      avtaleperiodeStart: toDate(agreement?.published),
      avtaleperiodeSlutt: toDate(agreement?.expired),
      previousAgreement: agreement?.previousAgreement ?? null,
    },
  });

  const { datepickerProps: datepickerPropsAvtaleperiodeStart, inputProps: inputPropsAvtaleperiodeStart } =
    useDatepicker({
      defaultSelected: toDate(agreement?.published),
      onDateChange: (value) => {
        if (value) setValue("avtaleperiodeStart", mergeDateWithTime(value, avtaleperiodeStartTid));
      },
    });

  const { datepickerProps: datepickerPropsAvtaleperiodeSlutt, inputProps: inputPropsAvtaleperiodeSlutt } =
    useDatepicker({
      defaultSelected: toDate(agreement.expired),
      onDateChange: (value) => {
        if (value) setValue("avtaleperiodeSlutt", mergeDateWithTime(value, avtaleperiodeSluttTid));
      },
    });

  const { setGlobalError } = useErrorStore();

  async function onSubmitClose(data: EditAgreementFormData) {
    await onSubmit(data);
    setModalIsOpen(false);
  }

  async function onSubmit(data: EditAgreementFormData) {
    setIsSaving(true);
    const avtaleperiodeStart = mergeDateWithTime(data.avtaleperiodeStart, avtaleperiodeStartTid);
    const avtaleperiodeSlutt = mergeDateWithTime(data.avtaleperiodeSlutt, avtaleperiodeSluttTid);

    const editAgreementFormDataDto: EditAgreementFormDataDto = {
      agreementName: data.agreementName,
      anbudsnummer: data.anbudsnummer,
      avtaleperiodeStart: toDateTimeString(avtaleperiodeStart),
      avtaleperiodeSlutt: toDateTimeString(avtaleperiodeSlutt),
      previousAgreement: data.previousAgreement ?? null,
    };

    updateAgreementInfo(agreement.id, editAgreementFormDataDto)
      .then(() => {
        mutateAgreement();
        setModalIsOpen(false);
        setIsSaving(false);
      })
      .catch((error) => {
        setGlobalError(error.message);
        setIsSaving(false);
      });
    reset();
  }

  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: "Rediger rammeavtale",
        closeButton: false,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <form>
        <Modal.Body>
          <Content>
            <VStack gap="space-16" style={{ width: "100%" }}>
              <TextField
                {...register("agreementName", { required: true })}
                label={labelRequired("Avtalenavn")}
                defaultValue={agreement?.title}
                id="agreementName"
                name="agreementName"
                type="text"
                error={errors?.agreementName?.message}
              />
              <div>
                <Label>Avtaleperiode</Label>
                <HStack gap="space-4" justify="start" style={{ marginTop: "0.5rem" }}>
                  <VStack gap="space-2">
                    <DatePicker {...datepickerPropsAvtaleperiodeStart}>
                      <DatePicker.Input
                        {...inputPropsAvtaleperiodeStart}
                        label={labelRequired("Fra")}
                        id="avtaleperiodeStart"
                        name="avtaleperiodeStart"
                        error={errors?.avtaleperiodeStart?.message}
                      />
                    </DatePicker>
                    <TextField
                      label={labelRequired("Tid")}
                      id="avtaleperiodeStartTid"
                      name="avtaleperiodeStartTid"
                      type="time"
                      step={60}
                      value={avtaleperiodeStartTid}
                      onChange={(event) => {
                        const value = event.target.value;
                        setAvtaleperiodeStartTid(value);
                        const currentDate = getValues("avtaleperiodeStart");
                        if (currentDate) {
                          setValue("avtaleperiodeStart", mergeDateWithTime(currentDate, value));
                        }
                      }}
                    />
                  </VStack>
                  <VStack gap="space-2">
                    <DatePicker {...datepickerPropsAvtaleperiodeSlutt}>
                      <DatePicker.Input
                        {...inputPropsAvtaleperiodeSlutt}
                        label={labelRequired("Til")}
                        id="avtaleperiodeSlutt"
                        name="avtaleperiodeSlutt"
                        error={errors?.avtaleperiodeSlutt?.message}
                      />
                    </DatePicker>
                    <TextField
                      label={labelRequired("Tid")}
                      id="avtaleperiodeSluttTid"
                      name="avtaleperiodeSluttTid"
                      type="time"
                      step={60}
                      value={avtaleperiodeSluttTid}
                      onChange={(event) => {
                        const value = event.target.value;
                        setAvtaleperiodeSluttTid(value);
                        const currentDate = getValues("avtaleperiodeSlutt");
                        if (currentDate) {
                          setValue("avtaleperiodeSlutt", mergeDateWithTime(currentDate, value));
                        }
                      }}
                    />
                  </VStack>
                </HStack>
              </div>
              <TextField
                disabled={false}
                {...register("anbudsnummer", { required: true })}
                label={labelRequired("Anbudsnummer")}
                id="anbudsnummer"
                name="anbudsnummer"
                defaultValue={agreement?.reference}
                type="text"
                error={errors?.anbudsnummer?.message}
              />
              <TextField
                disabled={false}
                {...register("previousAgreement", { required: false })}
                label={"Tidligere avtale"}
                id="previousAgreement"
                name="previousAgreement"
                defaultValue={agreement?.previousAgreement ?? undefined}
                type="text"
                error={errors?.previousAgreement?.message}
              />
            </VStack>
          </Content>
          {isSaving && (
            <HStack justify="center">
              <Loader size="2xlarge" title="venter..." />
            </HStack>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => {
              setModalIsOpen(false);
              reset();
            }}
            variant="tertiary"
            type="reset"
          >
            Avbryt
          </Button>
          <Button onClick={handleSubmit(onSubmitClose)} type="submit" variant="secondary">
            Lagre endringer
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default EditAgreementInfoModal;
