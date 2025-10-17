import { forwardRef } from "react";
import { IsoBoxProps } from "products/iso-combobox/types";
import Combobox from "felleskomponenter/comboboxfelles/Combobox";
import FilteredOptions from "products/iso-combobox/FilteredOptions/FilteredOptions";
import { useFilteredOptionsContext } from "products/iso-combobox/FilteredOptions/filteredOptionsContext";
import { InputControllerIso } from "products/iso-combobox/Input/InputControllerIso";
import { omit } from "felleskomponenter/comboboxfelles/utils";

const IsoCombobox = forwardRef<
  HTMLInputElement,
  Omit<IsoBoxProps, "onChange" | "options" | "onClear" | "value">
>(function IsoCombobox(props, ref) {
  const { toggleIsListOpen } = useFilteredOptionsContext();

  return (
    <Combobox toggleIsListOpen={toggleIsListOpen} {...props}>
      <InputControllerIso ref={ref} {...omit({ ...props }, ["label", "description"])} />
      <FilteredOptions />
    </Combobox>
  );
});

export default IsoCombobox;
