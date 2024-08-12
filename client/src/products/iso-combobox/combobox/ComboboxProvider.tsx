import { forwardRef } from "react";
import Combobox from "./Combobox";
import { FilteredOptionsProvider } from "./FilteredOptions/filteredOptionsContext";
import { InputContextProvider } from "./Input/Input.context";
import { SelectedOptionsProvider } from "./SelectedOptions/selectedOptionsContext";
import { mapToComboboxOptionArray } from "./combobox-utils";
import { CustomOptionsProvider } from "./customOptionsContext";
import { ComboboxProps } from "./types";

const ComboboxProvider = forwardRef<HTMLInputElement, ComboboxProps>(function ComboboxProvider(props, ref) {
  const {
    allowNewValues = false,
    children,
    defaultValue,
    error,
    errorId,
    filteredOptions: externalFilteredOptions,
    id,
    isListOpen,
    isLoading = false,
    onToggleSelected,
    selectedOptions: externalSelectedOptions,
    maxSelected,
    options: externalOptions,
    value,
    onChange,
    onClear,
    shouldAutocomplete,
    size,
    ...rest
  } = props;
  const options = mapToComboboxOptionArray(externalOptions) || [];
  const filteredOptions = mapToComboboxOptionArray(externalFilteredOptions);
  const selectedOptions = mapToComboboxOptionArray(externalSelectedOptions);
  return (
    <InputContextProvider
      value={{
        defaultValue,
        description: rest.description,
        error,
        errorId,
        id,
        value,
        onChange,
        onClear,
        shouldAutocomplete,
        size,
      }}
    >
      <CustomOptionsProvider>
        <SelectedOptionsProvider
          value={{
            allowNewValues,
            selectedOptions,
            maxSelected,
            onToggleSelected,
            options,
          }}
        >
          <FilteredOptionsProvider
            value={{
              allowNewValues,
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
      </CustomOptionsProvider>
    </InputContextProvider>
  );
});

export default ComboboxProvider;
