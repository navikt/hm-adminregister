import { ComboboxOption, ComboboxProps } from "felleskomponenter/comboboxfelles/types";

export interface IsoBoxProps extends ComboboxProps {
  filteredOptions?: string[] | ComboboxOption[];
  isListOpen?: boolean;
  isLoading?: boolean;
}
