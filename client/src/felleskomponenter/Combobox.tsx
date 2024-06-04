import { UNSAFE_Combobox } from "@navikt/ds-react";
import { useEffect, useState } from "react";

type Props = {
  defaultValue?: string;
  options?: string[];
  setValue?(value: string): void;
  label?: JSX.Element;
  errorMessage?: string;
  description?: string;
  typeCombobox?: string;
  selectedOption?: string[];
};

export default function Combobox({ defaultValue, options, setValue, label, errorMessage, selectedOption, description, typeCombobox = "default" }: Props) {
  const [inputValue, setInputValue] = useState("");
/*  const [inputValueArray, setInputValueArray] = useState([""]);*/
  const [selectedOptions, setSelectedOptions] = useState<string[]>(defaultValue ? [defaultValue] : selectedOption || []);
  const [filteredOptions, setFilteredOptions] = useState<string[]>();

  const onToggleSelected = (option: string, isSelected: boolean) => {
    console.log(`option = ${option}, isSelected ${isSelected}`)
    if (isSelected) {
      setSelectedOptions([...selectedOptions, option])
      setValue && setValue(option);
    } else {
      setSelectedOptions(selectedOptions.filter((o) => o !== option))
      setValue && setValue("");
    }
  };

  useEffect(() => {
    const filtered = options?.filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()));
    setFilteredOptions(filtered);
  }, [inputValue, options]);

  return (
      <>
        {(typeCombobox ===  "maxSelectedLimit") && (
            <UNSAFE_Combobox
                id="keywords"
                label="Nøkkelord"
                description={description || ""}
                // options={options}
                isMultiSelect
                shouldAutocomplete={false}
                clearButton={true}
                shouldShowSelectedOptions
                options={["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]}
                selectedOptions={selectedOptions}
                maxSelected={{ limit: 3 }}
/*                onToggleSelected={onToggleSelected}*/
                  onToggleSelected={(option: string, isSelected: boolean) => /*console.log(`option = ${option}, isSelected ${isSelected}`)}*/
                   isSelected
                        ? setSelectedOptions([...selectedOptions, option])
                        : setSelectedOptions(selectedOptions.filter((o) => o !== option))
                }
/*                onChange={(event) => {
                  setInputValueArray(...event?.target.value || "");
                }}*/
                error={errorMessage && errorMessage}
            />
        )}

      {(typeCombobox ===  "default") && (
    <UNSAFE_Combobox
      label={label || ""}
      description={"Velg isokategori produktet passer best inn i"}
      selectedOptions={selectedOptions}
      onChange={(event) => {
        setInputValue(event?.target.value || "");
      }}
      filteredOptions={filteredOptions}
      options={options || []}
      shouldAutocomplete={false}
      clearButton={true}
      onToggleSelected={onToggleSelected}
      error={errorMessage && errorMessage}
    />
      )}
      </>
  );
}
