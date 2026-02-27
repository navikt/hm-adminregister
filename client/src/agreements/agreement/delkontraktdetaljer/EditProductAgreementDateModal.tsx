import { Button, DatePicker, HStack, Label, Loader, Modal, useDatepicker, VStack } from "@navikt/ds-react";
import React, { useState } from "react";
import { ProductAgreementRegistrationDTO } from "utils/types/response-types";
import { labelRequired } from "utils/string-util";
import { toDate, toDateTimeString } from "utils/date-util";
import Content from "felleskomponenter/styledcomponents/Content";
import { EditProductAgreementDatesFormDataDto } from "utils/zodSchema/editProductAgreementDates";
import { changePublishedExpiredOnProductAgreements } from "api/AgreementProductApi";

interface Props {
  modalIsOpen: boolean;
  setModalIsOpen: (open: boolean) => void;
  mutateProductAgreements: () => void;
  productAgreementsToUpdate: ProductAgreementRegistrationDTO[];
  mutateDelkontrakter: () => void;
}

const EditProductAgreementDateModal = ({
  modalIsOpen,
  setModalIsOpen,
  mutateProductAgreements,
  productAgreementsToUpdate,
  mutateDelkontrakter,
}: Props) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feilmeldingPublished, setFeilmeldingPublished] = useState<string | null>(null);
  const [feilmeldingExpired, setFeilmeldingExpired] = useState<string | null>(null);
  const [published, setPublished] = useState<Date | undefined>(toDate(productAgreementsToUpdate[0]?.published));
  const [expired, setExpired] = useState<Date | undefined>(toDate(productAgreementsToUpdate[0]?.expired));

  const { datepickerProps: datepickerPropsPublished, inputProps: inputPropsPublished } = useDatepicker({
    defaultSelected: published,
    onDateChange: (value) => {
      if (value) {
        setPublished(value);
        setFeilmeldingPublished(null);
      } else {
        setFeilmeldingPublished("Du må velge en dato");
      }
    },
  });

  const { datepickerProps: datepickerPropsExpired, inputProps: inputPropsExpired } = useDatepicker({
    defaultSelected: expired,
    onDateChange: (value) => {
      if (value) {
        setExpired(value);
        setFeilmeldingExpired(null);
      } else {
        setFeilmeldingExpired("Du må velge en dato");
      }
    },
  });

  async function onSubmit() {
    if (feilmeldingExpired || feilmeldingPublished || !published || !expired) {
      setIsSaving(false);
      return;
    }

    setIsSaving(true);

    const editAgreementFormDataDto: EditProductAgreementDatesFormDataDto = {
      published: toDateTimeString(published),
      expired: toDateTimeString(expired),
    };

    changePublishedExpiredOnProductAgreements(
      productAgreementsToUpdate.map((product) => product.id),
      editAgreementFormDataDto,
    ).then(() => {
      setIsSaving(false);
      mutateProductAgreements();
      mutateDelkontrakter();
      setModalIsOpen(false);
    });
  }

  return (
    <Modal
      open={modalIsOpen}
      header={{
        heading: "Rediger periode for tilknytting",
        closeButton: false,
      }}
      onClose={() => setModalIsOpen(false)}
    >
      <Modal.Body>
        <Content>
          <VStack gap="space-6" style={{ width: "100%" }}>
            <div>
              <Label>Avtaleperiode</Label>
              <HStack gap="space-4" justify="start" style={{ marginTop: "0.5rem" }}>
                <DatePicker {...datepickerPropsPublished}>
                  <DatePicker.Input
                    {...inputPropsPublished}
                    label={labelRequired("Fra")}
                    id="published"
                    name="published"
                    error={feilmeldingPublished}
                  />
                </DatePicker>
                <DatePicker {...datepickerPropsExpired}>
                  <DatePicker.Input
                    {...inputPropsExpired}
                    label={labelRequired("Til")}
                    id="expired"
                    name="expired"
                    error={feilmeldingExpired}
                  />
                </DatePicker>
              </HStack>
            </div>
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
          }}
          variant="tertiary"
          type="reset"
        >
          Avbryt
        </Button>
        <Button onClick={onSubmit} variant="secondary">
          Lagre endringer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProductAgreementDateModal;
