import { forwardRef } from "react";
import Combobox from "./Combobox";
import { FilteredOptionsProvider } from "./FilteredOptions/filteredOptionsContext";
import { InputContextProvider } from "./Input/Input.context";
import { SelectedOptionsProvider } from "./SelectedOptions/selectedOptionsContext";
import { mapToComboboxOptionArray } from "felleskomponenter/comboboxfelles/combobox-utils";
import { IsoBoxProps } from "./index";

const ComboboxProvider = forwardRef<HTMLInputElement, IsoBoxProps>(function ComboboxProvider(props, ref) {
  const {
    children,
    error,
    filteredOptions: externalFilteredOptions,
    id,
    isListOpen,
    isLoading = false,
    onToggleSelected,
    selectedOptions: externalSelectedOptions,
    options: externalOptions,
    value,
    onChange,
    onClear,
    maxSelected,
    ...rest
  } = props;
  const options = mapToComboboxOptionArray(externalOptions) || [];
  const filteredOptions = mapToComboboxOptionArray(externalFilteredOptions);
  const selectedOptions = mapToComboboxOptionArray(externalSelectedOptions);
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
          <Combobox ref={ref} {...rest}>
            {children}
          </Combobox>
        </FilteredOptionsProvider>
      </SelectedOptionsProvider>
    </InputContextProvider>
  );
});

export default ComboboxProvider;
