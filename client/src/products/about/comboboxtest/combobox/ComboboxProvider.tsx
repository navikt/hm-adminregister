import { forwardRef } from "react";
import Combobox from "./Combobox";
import { InputContextProvider } from "./Input/Input.context";
import { SelectedOptionsProvider } from "./SelectedOptions/selectedOptionsContext";
import { mapToComboboxOptionArray } from "./combobox-utils";
import { CustomOptionsProvider } from "./customOptionsContext";
import { ComboboxProps } from "./types";

const ComboboxProvider = forwardRef<HTMLInputElement, ComboboxProps>(function ComboboxProvider(props, ref) {
  const {
    children,
    defaultValue,
    disabled,
    error,
    errorId,
    id,
    onToggleSelected,
    selectedOptions: externalSelectedOptions,
    maxSelected,
    options: externalOptions,
    value,
    onChange,
    onClear,
    ...rest
  } = props;
  const options = mapToComboboxOptionArray(externalOptions) || [];
  const selectedOptions = mapToComboboxOptionArray(externalSelectedOptions);
  return (
    <InputContextProvider
      value={{
        defaultValue,
        description: rest.description,
        disabled,
        error,
        errorId,
        id,
        value,
        onChange,
        onClear,
      }}
    >
      <CustomOptionsProvider>
        <SelectedOptionsProvider
          value={{
            selectedOptions,
            maxSelected,
            onToggleSelected,
            options,
          }}
        >
          <Combobox ref={ref} {...rest}>
            {children}
          </Combobox>
        </SelectedOptionsProvider>
      </CustomOptionsProvider>
    </InputContextProvider>
  );
});

export default ComboboxProvider;
