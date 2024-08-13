import { useEffect, useState } from "react";
import { ISO_Combobox } from "products/iso-combobox/combobox";

type Props = {
  defaultValue?: string;
  options?: string[];
  setValue?(value: string): void;
  label?: JSX.Element;
  errorMessage?: string;
};

export default function Combobox({ defaultValue, options, setValue, label, errorMessage }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>(defaultValue ? [defaultValue] : []);
  const [filteredOptions, setFilteredOptions] = useState<string[]>();

  const onToggleSelected = (option: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedOptions([option]);
      setValue && setValue(option);
    } else {
      setSelectedOptions([]);
      setValue && setValue("");
    }
  };

  useEffect(() => {
    const filtered = options?.filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()));
    setFilteredOptions(filtered);
  }, [inputValue, options]);

  return (
    <ISO_Combobox
      label={label || ""}
      description={"Søk etter isokategori produktet passer best inn i"}
      selectedOptions={selectedOptions}
      onChange={(value) => {
        setInputValue(value || "");
      }}
      filteredOptions={filteredOptions}
      options={options || []}
      onToggleSelected={onToggleSelected}
      error={errorMessage && errorMessage}
      maxSelected={{ limit: 1 }}
    />
  );
}
