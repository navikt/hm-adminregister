import { Button, DatePicker, HStack, Label, Loader, Modal, TextField, useDatepicker, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useErrorStore } from "utils/store/useErrorStore";
import { EditAgreementFormData, EditAgreementFormDataDto, editAgreementSchema } from "utils/zodSchema/editAgreement";
import { updateAgreementInfo } from "api/AgreementApi";
import { AgreementRegistrationDTO } from "utils/types/response-types";
import { labelRequired } from "utils/string-util";
import { toDate, toDateTimeString } from "utils/date-util";
import Content from "felleskomponenter/styledcomponents/Content";

interface Props {
  modalIsOpen: boolean;
  agreement: AgreementRegistrationDTO;
  setModalIsOpen: (open: boolean) => void;
  mutateAgreement: () => void;
}

const EditRammeavtaleInfoModal = ({ modalIsOpen, agreement, setModalIsOpen, mutateAgreement }: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<EditAgreementFormData>({
    resolver: zodResolver(editAgreementSchema),
    mode: "onSubmit",
    defaultValues: {
      agreementName: agreement?.title,
      anbudsnummer: agreement?.reference,
      avtaleperiodeStart: toDate(agreement?.published),
      avtaleperiodeSlutt: toDate(agreement?.expired),
    },
  });

  const { datepickerProps: datepickerPropsAvtaleperiodeStart, inputProps: inputPropsAvtaleperiodeStart } =
    useDatepicker({
      fromDate: new Date("Jan 01 2015"),
      toDate: new Date("Jan 01 2025"),
      defaultSelected: toDate(agreement?.published),
      onDateChange: (value) => {
        if (value) setValue("avtaleperiodeStart", value);
      },
    });

  const { datepickerProps: datepickerPropsAvtaleperiodeSlutt, inputProps: inputPropsAvtaleperiodeSlutt } =
    useDatepicker({
      defaultSelected: toDate(agreement.expired),
      onDateChange: (value) => {
        if (value) setValue("avtaleperiodeSlutt", value);
      },
    });

  const { setGlobalError } = useErrorStore();

  async function onSubmitClose(data: EditAgreementFormData) {
    await onSubmit(data);
    setModalIsOpen(false);
  }

  async function onSubmit(data: EditAgreementFormData) {
    setIsSaving(true);

    const editAgreementFormDataDto: EditAgreementFormDataDto = {
      agreementName: data.agreementName,
      anbudsnummer: data.anbudsnummer,
      avtaleperiodeStart: toDateTimeString(data.avtaleperiodeStart),
      avtaleperiodeSlutt: toDateTimeString(data.avtaleperiodeSlutt),
    };

    updateAgreementInfo(agreement.id, editAgreementFormDataDto)
      .then((agreement) => {
        setIsSaving(false);
        mutateAgreement();
        setModalIsOpen(false);
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
            <VStack gap="5" style={{ width: "100%" }}>
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
                <HStack gap="4" justify="start" style={{ marginTop: "0.5rem" }}>
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
                disabled={agreement.draftStatus !== "DRAFT"}
                {...register("anbudsnummer", { required: true })}
                label={labelRequired("Anbudsnummer")}
                id="anbudsnummer"
                name="anbudsnummer"
                defaultValue={agreement?.reference}
                type="text"
                error={errors?.anbudsnummer?.message}
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

export default EditRammeavtaleInfoModal;
