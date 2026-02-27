import { useState } from "react";
import { Button, Modal, Radio, RadioGroup, VStack } from "@navikt/ds-react";
import Content from "felleskomponenter/styledcomponents/Content";
import { useIsoCategories } from "utils/swr-hooks";
import IsoComboboxProvider from "products/iso-combobox/IsoComboboxProvider";
import { labelRequired } from "utils/string-util";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onClick: (accessory: boolean, newIsoCode: string) => void;
}

type Error = {
  isoCodeErrorMessage?: string;
  partTypeErrorMessage?: string;
};

const ChangeProductToPartModal = ({ isOpen, setIsOpen, onClick }: Props) => {
  const { isoCategories } = useIsoCategories();
  const [isoCategory, setIsoCategory] = useState<string>("");
  const uniqueIsoCodes = isoCategories?.filter(
    (cat) => cat.isoCode && cat.isoCode.length === 6 && /9[0-6]$/.test(cat.isoCode),
  );
  const isoCodesAndTitles = uniqueIsoCodes?.map((cat) => cat.isoTitle + " - " + cat.isoCode).sort();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [partType, setPartType] = useState<"sparePart" | "accessory" | undefined>(undefined);
  const [fieldError, setFieldError] = useState<Error | undefined>(undefined);

  const handleSetFormValueIso = (value: string) => {
    const parts = value.split("-");
    return parts[parts.length - 1].replace(/\s/g, ""); // Remove spaces
  };

  const validateFields = () => {
    const isoError = !isoCategory || isoCategory === "";
    const partTypeError = !partType;
    setFieldError({
      isoCodeErrorMessage: isoError ? "Du må velge en iso-kategori" : undefined,
      partTypeErrorMessage: partTypeError ? "Du må velge deltype" : undefined,
    });

    return !isoError && !partTypeError;
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
    if (validateFields() && partType) {
      onClick(partType === "accessory", handleSetFormValueIso(isoCategory));
    }
  };

  return (
    <Modal
      open={isOpen}
      header={{
        heading: "Endre produkt til del",
        closeButton: false,
      }}
      onClose={() => setIsOpen(false)}
    >
      <Modal.Body>
        <Content>
          <VStack gap="space-4">
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
              legend="Velg deltype"
              value={partType}
              onChange={(v) => setPartType(v as "sparePart" | "accessory")}
              error={fieldError?.partTypeErrorMessage}
            >
              <Radio value="sparePart">Reservedel</Radio>
              <Radio value="accessory">Tilbehør</Radio>
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

export default ChangeProductToPartModal;
