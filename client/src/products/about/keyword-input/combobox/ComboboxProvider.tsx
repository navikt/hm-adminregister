import { forwardRef } from "react";
import Combobox from "./Combobox";
import { InputContextProvider } from "./Input/Input.context";
import { SelectedOptionsProvider } from "./SelectedOptions/selectedOptionsContext";
import { mapToComboboxOptionArray } from "./combobox-utils";
import { ComboboxProps } from "./types";

const ComboboxProvider = forwardRef<HTMLInputElement, ComboboxProps>(function ComboboxProvider(props, ref) {
  const {
    children,
    defaultValue,
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
        error,
        errorId,
        id,
        value,
        onChange,
        onClear,
      }}
    >
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
    </InputContextProvider>
  );
});

export default ComboboxProvider;
