import React from "react";
import { useInputContext } from "felleskomponenter/comboboxfelles/Input/Input.context";
import { ComboboxOption } from "../index";
import { useSelectedOptionsContext } from "felleskomponenter/comboboxfelles/SelectedOptions/selectedOptionsContext";
import { Chips } from "@navikt/ds-react";

interface SelectedOptionsProps {
  selectedOptions?: ComboboxOption[];
  children: React.ReactNode;
}

const Option = ({ option }: { option: ComboboxOption }) => {
  const { removeSelectedOption } = useSelectedOptionsContext();
  const { focusInput } = useInputContext();

  const onClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    removeSelectedOption(option);
    focusInput();
  };

  return <Chips.Removable onClick={onClick}>{option.label}</Chips.Removable>;
};

const SelectedOptions: React.FC<SelectedOptionsProps> = ({ selectedOptions = [], children }) => {
  return (
    <Chips className="navds-combobox__selected-options">
      {selectedOptions.length
        ? selectedOptions.map((option, i) => <Option key={option.label + i} option={option} />)
        : []}
      {children}
    </Chips>
  );
};

export default SelectedOptions;
