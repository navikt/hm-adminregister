import { useState } from "react";
import { Button, Modal, Radio, RadioGroup, VStack } from "@navikt/ds-react";
import Content from "felleskomponenter/styledcomponents/Content";
import { useIsoCategories } from "utils/swr-hooks";
import IsoComboboxProvider from "products/iso-combobox/IsoComboboxProvider";
import { labelRequired } from "utils/string-util";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onClick: (isoCategory: string, resetTechnicalData: boolean) => void;
}

type Error = {
  isoCodeErrorMessage?: string;
};

const ChangeISOCategoryModal = ({ isOpen, setIsOpen, onClick }: Props) => {
  const { isoCategories } = useIsoCategories();
  const [isoCategory, setIsoCategory] = useState<string>("");
  const uniqueIsoCodes = isoCategories?.filter((cat) => cat.isoCode && cat.isoCode.length >= 8);
  const isoCodesAndTitles = uniqueIsoCodes?.map((cat) => cat.isoTitle + " - " + cat.isoCode).sort();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [resetTechnicalData, setResetTechnicalData] = useState<"Ja" | "Nei">("Nei");
  const [fieldError, setFieldError] = useState<Error | undefined>(undefined);

  const handleSetFormValueIso = (value: string) => {
    const parts = value.split("-");
    return parts[parts.length - 1].replace(/\s/g, ""); // Remove spaces
  };

  const validateFields = () => {
    const isoError = !isoCategory || isoCategory === "";
    setFieldError({
      isoCodeErrorMessage: isoError ? "Du må velge en iso-kategori" : undefined,
    });

    return !isoError;
  };

  const onToggleSelected = (option: string, isSelected: boolean) => {
    if (isSelected) {
      setIsoCategory(option);
      setSelectedOptions([option]);
    } else {
      setIsoCategory("");
      setSelectedOptions([]);
    }
  };

  const onSubmit = () => {
    if (validateFields() ) {
      onClick(handleSetFormValueIso(isoCategory), resetTechnicalData === "Ja");
    }
  };

  return (
    <Modal
      open={isOpen}
      header={{
        heading: "Endre ISO-kategori",
        closeButton: false,
      }}
      onClose={() => setIsOpen(false)}
    >
      <Modal.Body>
        <Content>
          <VStack gap="4">
            <IsoComboboxProvider
              label={labelRequired("Iso-kategori (kode)")}
              description={"Søk etter isokategori delen passer best inn i"}
              selectedOptions={selectedOptions}
              options={isoCodesAndTitles || []}
              onToggleSelected={onToggleSelected}
              onBlur={() => setFieldError({ ...fieldError, isoCodeErrorMessage: undefined })}
              onFocus={() => setFieldError({ ...fieldError, isoCodeErrorMessage: undefined })}
              error={fieldError?.isoCodeErrorMessage ?? ""}
              maxSelected={{ limit: 1 }}
            />
            <RadioGroup
              legend="Velg om du vil nullstille alle felter eller beholde teknisk data som har samme navn i ny og gammel ISO"
              value={resetTechnicalData}
              onChange={(v) => setResetTechnicalData(v as "Ja" | "Nei")}
            >
              <Radio value="Nei">Behold teknisk data som passer ny ISO</Radio>
              <Radio value="Ja">Nullstill alle felter</Radio>
            </RadioGroup>
          </VStack>
        </Content>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setIsOpen(false)}>
          Avbryt
        </Button>
        <Button onClick={onSubmit} variant="primary">
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangeISOCategoryModal;
