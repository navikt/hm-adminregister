import { forwardRef } from "react";
import Combobox from "./Combobox";
import { InputContextProvider } from "felleskomponenter/comboboxfelles/Input/Input.context";
import { SelectedOptionsProvider } from "felleskomponenter/comboboxfelles/SelectedOptions/selectedOptionsContext";
import { mapToComboboxOptionArray } from "felleskomponenter/comboboxfelles/combobox-utils";
import { ComboboxProps } from "./index";

const ComboboxProvider = forwardRef<HTMLInputElement, ComboboxProps>(function ComboboxProvider(props, ref) {
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
    ...rest
  } = props;
  const options = mapToComboboxOptionArray(externalOptions) || [];
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
