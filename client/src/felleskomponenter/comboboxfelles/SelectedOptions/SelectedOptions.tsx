import { FC, MouseEvent, ReactNode } from "react";
import { Chips } from "@navikt/ds-react";
import { ComboboxOption } from "felleskomponenter/comboboxfelles/types";
import { useSelectedOptionsContext } from "felleskomponenter/comboboxfelles/SelectedOptions/selectedOptionsContext";
import { useInputContext } from "felleskomponenter/comboboxfelles/Input/Input.context";

interface SelectedOptionsProps {
  selectedOptions?: ComboboxOption[];
  removable: boolean;
  children: ReactNode;
}

const Option = ({ option, removable }: { option: ComboboxOption; removable: boolean }) => {
  const { removeSelectedOption } = useSelectedOptionsContext();
  const { focusInput } = useInputContext();
  const onClick = (e: MouseEvent) => {
    e.stopPropagation();
    removeSelectedOption(option);
    focusInput();
  };

  if (!removable) {
    return <div className="navds-combobox__selected-options--no-bg">{option.label}</div>;
  }
  return <Chips.Removable onClick={onClick}>{option.label}</Chips.Removable>;
};

const SelectedOptions: FC<SelectedOptionsProps> = ({ selectedOptions = [], removable, children }) => {
  return (
    <Chips className="navds-combobox__selected-options">
      {selectedOptions.length
        ? selectedOptions.map((option, i) => <Option key={option.label + i} option={option} removable={removable} />)
        : []}
      {children}
    </Chips>
  );
};

export default SelectedOptions;
