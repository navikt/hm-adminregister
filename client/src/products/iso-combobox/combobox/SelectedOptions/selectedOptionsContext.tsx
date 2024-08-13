import React, { ReactNode, useCallback, useMemo, useState } from "react";
import { createContext } from "../../util/create-context";
import { usePrevious } from "../../util";
import { useInputContext } from "../Input/Input.context";
import { isInList } from "../combobox-utils";
import { ComboboxOption, ComboboxProps, MaxSelected } from "../types";

type SelectedOptionsContextValue = {
  addSelectedOption: (option: ComboboxOption) => void;
  removeSelectedOption: (option: ComboboxOption) => void;
  prevSelectedOptions?: ComboboxOption[];
  selectedOptions: ComboboxOption[];
  maxSelected?: MaxSelected;
  setSelectedOptions: (options: ComboboxOption[]) => void | ComboboxOption[];
  toggleOption: (option: ComboboxOption, event: React.KeyboardEvent | React.PointerEvent) => void;
};

const [SelectedOptionsContextProvider, useSelectedOptionsContext] = createContext<SelectedOptionsContextValue>();

const SelectedOptionsProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: Pick<ComboboxProps, "onToggleSelected" | "maxSelected"> & {
    options: ComboboxOption[];
    selectedOptions?: ComboboxOption[];
  };
}) => {
  const { clearInput, focusInput } = useInputContext();
  const { selectedOptions: externalSelectedOptions, onToggleSelected, options, maxSelected } = value;
  const [internalSelectedOptions, setSelectedOptions] = useState<ComboboxOption[]>([]);
  const selectedOptions = useMemo(
    () => externalSelectedOptions ?? [...internalSelectedOptions],
    [externalSelectedOptions, internalSelectedOptions],
  );

  const addSelectedOption = useCallback(
    (option: ComboboxOption) => {
      setSelectedOptions([option]);
      onToggleSelected?.(option.value, true);
    },
    [onToggleSelected, options],
  );

  const removeSelectedOption = useCallback(
    (option: ComboboxOption) => {
      setSelectedOptions((oldSelectedOptions) =>
        oldSelectedOptions.filter((selectedOption) => selectedOption !== option),
      );
      onToggleSelected?.(option.value, false);
    },
    [onToggleSelected],
  );

  const toggleOption = useCallback(
    (option: ComboboxOption, event: React.KeyboardEvent | React.PointerEvent) => {
      if (isInList(option.value, selectedOptions)) {
        removeSelectedOption(option);
      } else {
        addSelectedOption(option);
      }
      clearInput(event);
      focusInput();
    },
    [addSelectedOption, clearInput, focusInput, removeSelectedOption, selectedOptions],
  );

  const prevSelectedOptions = usePrevious<ComboboxOption[]>(selectedOptions);

  const isLimitReached = !!maxSelected?.limit && selectedOptions.length >= maxSelected.limit;

  const selectedOptionsState = {
    addSelectedOption,
    removeSelectedOption,
    prevSelectedOptions,
    selectedOptions,
    setSelectedOptions,
    toggleOption,
    maxSelected: maxSelected && {
      ...maxSelected,
      isLimitReached,
    },
  };

  return <SelectedOptionsContextProvider {...selectedOptionsState}>{children}</SelectedOptionsContextProvider>;
};

export { SelectedOptionsProvider, useSelectedOptionsContext };
