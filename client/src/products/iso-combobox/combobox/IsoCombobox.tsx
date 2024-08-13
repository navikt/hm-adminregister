import { forwardRef } from "react";
import { IsoBoxProps } from "products/iso-combobox/combobox/types";
import Combobox from "felleskomponenter/comboboxfelles/Combobox";
import FilteredOptions from "products/iso-combobox/combobox/FilteredOptions/FilteredOptions";
import { useFilteredOptionsContext } from "products/iso-combobox/combobox/FilteredOptions/filteredOptionsContext";
import { InputControllerIso } from "products/iso-combobox/combobox/Input/InputControllerIso";

export const IsoCombobox = forwardRef<
  HTMLInputElement,
  Omit<IsoBoxProps, "onChange" | "options" | "onClear" | "value">
>(function IsoCombobox(props, ref) {
  const { toggleIsListOpen } = useFilteredOptionsContext();

  return (
    <Combobox toggleIsListOpen={toggleIsListOpen} {...props}>
      <InputControllerIso ref={ref} {...props} />
      <FilteredOptions />
    </Combobox>
  );
});

export default IsoCombobox;
