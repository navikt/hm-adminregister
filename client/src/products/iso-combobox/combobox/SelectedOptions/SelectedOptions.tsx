import React from "react";
import { ComboboxOption } from "../types";
import { Chips } from "@navikt/ds-react";

interface SelectedOptionsProps {
  selectedOptions?: ComboboxOption[];
  size?: "medium" | "small";
  children: React.ReactNode;
}

const Option = ({ option }: { option: ComboboxOption }) => {
  return <div className="navds-combobox__selected-options--no-bg">{option.label}</div>;
};

const SelectedOptions: React.FC<SelectedOptionsProps> = ({ selectedOptions = [], size, children }) => {
  return (
    <Chips className="navds-combobox__selected-options" size={size}>
      {selectedOptions.length
        ? selectedOptions.map((option, i) => <Option key={option.label + i} option={option} />)
        : []}
      {children}
    </Chips>
  );
};

export default SelectedOptions;
