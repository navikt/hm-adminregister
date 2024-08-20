import { forwardRef } from "react";
import { FilteredOptionsProvider } from "./FilteredOptions/filteredOptionsContext";
import { InputContextProvider } from "felleskomponenter/comboboxfelles/Input/Input.context";
import { SelectedOptionsProvider } from "felleskomponenter/comboboxfelles/SelectedOptions/selectedOptionsContext";
import { mapToComboboxOptionArray } from "felleskomponenter/comboboxfelles/combobox-utils";
import { IsoBoxProps } from "./types";
import IsoCombobox from "products/iso-combobox/IsoCombobox";

const IsoComboboxProvider = forwardRef<HTMLInputElement, IsoBoxProps>(function ComboboxProvider(props, ref) {
  const {
    children,
    error,
    id,
    onToggleSelected,
    selectedOptions: externalSelectedOptions,
    maxSelected,
    options: externalOptions,
    value,
    onChange,
    onClear,
    filteredOptions: externalFilteredOptions,
    isListOpen,
    isLoading = false,
    ...rest
  } = props;
  const options = mapToComboboxOptionArray(externalOptions) || [];
  const selectedOptions = mapToComboboxOptionArray(externalSelectedOptions);
  const filteredOptions = mapToComboboxOptionArray(externalFilteredOptions);
  return (
    <InputContextProvider
      value={{
        description: rest.description,
        error,
        id,
        value,
        onChange,
        onClear,
      }}
    >
      <SelectedOptionsProvider
        value={{
          selectedOptions,
          onToggleSelected,
          options,
          maxSelected,
        }}
      >
        <FilteredOptionsProvider
          value={{
            filteredOptions,
            isListOpen,
            isLoading,
            options,
          }}
        >
          <IsoCombobox ref={ref} {...rest}>
            {children}
          </IsoCombobox>
        </FilteredOptionsProvider>
      </SelectedOptionsProvider>
    </InputContextProvider>
  );
});

export default IsoComboboxProvider;
