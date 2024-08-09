import cl from "clsx";
import React, { SetStateAction, useMemo, useState } from "react";
import { createContext } from "../../util/create-context";
import { useInputContext } from "../Input/Input.context";
import { useSelectedOptionsContext } from "../SelectedOptions/selectedOptionsContext";
import { toComboboxOption } from "../combobox-utils";
import { useComboboxCustomOptions } from "../customOptionsContext";
import { ComboboxOption, ComboboxProps } from "../types";
import filteredOptionsUtils from "./filtered-options-util";
import useVirtualFocus, { VirtualFocusType } from "./useVirtualFocus";

type FilteredOptionsProps = {
  children: React.ReactNode;
  value: {
    filteredOptions?: ComboboxOption[];
    options: ComboboxOption[];
  };
};

type FilteredOptionsContextValue = {
  activeDecendantId?: string;
  ariaDescribedBy?: string;
  setFilteredOptionsRef: React.Dispatch<React.SetStateAction<HTMLUListElement | null>>;
  filteredOptions: ComboboxOption[];
  isMouseLastUsedInputDevice: boolean;
  setIsMouseLastUsedInputDevice: React.Dispatch<SetStateAction<boolean>>;
  isValueNew: boolean;
  currentOption?: ComboboxOption;
  virtualFocus: VirtualFocusType;
};
const [FilteredOptionsContextProvider, useFilteredOptionsContext] = createContext<FilteredOptionsContextValue>({
  name: "FilteredOptionsContext",
  errorMessage: "useFilteredOptionsContext must be used within a FilteredOptionsProvider",
});

const FilteredOptionsProvider = ({ children, value: props }: FilteredOptionsProps) => {
  const { filteredOptions: externalFilteredOptions, options } = props;
  const [filteredOptionsRef, setFilteredOptionsRef] = useState<HTMLUListElement | null>(null);
  const virtualFocus = useVirtualFocus(filteredOptionsRef);
  const {
    inputProps: { "aria-describedby": partialAriaDescribedBy, id },
    value,
  } = useInputContext();
  const { maxSelected } = useSelectedOptionsContext();

  const { customOptions } = useComboboxCustomOptions();

  const filteredOptions = useMemo(() => {
    if (externalFilteredOptions) {
      return externalFilteredOptions;
    }
    const opts = [...customOptions, ...options];
    return filteredOptionsUtils.getMatchingValuesFromList(value, opts);
  }, [customOptions, externalFilteredOptions, options]);

  const [isMouseLastUsedInputDevice, setIsMouseLastUsedInputDevice] = useState(false);

  const filteredOptionsMap = useMemo(() => {
    const initialMap = {
      [filteredOptionsUtils.getAddNewOptionId(id)]: toComboboxOption(value),
      ...customOptions.reduce((acc, customOption) => {
        const _id = filteredOptionsUtils.getOptionId(id, customOption.label);
        acc[_id] = customOption;
        return acc;
      }, {}),
    };

    // Add the options to the map
    const finalMap = options.reduce((map, _option) => {
      const _id = filteredOptionsUtils.getOptionId(id, _option.label);
      map[_id] = _option;
      return map;
    }, initialMap);

    return finalMap;
  }, [customOptions, id, options, value]);

  const isValueNew = useMemo(() => Boolean(value), [filteredOptionsMap, id, value]);

  const ariaDescribedBy = useMemo(() => {
    let activeOption: string = "";
    if (value) {
      if (filteredOptions[0]) {
        activeOption = filteredOptionsUtils.getOptionId(id, filteredOptions[0].label);
      }
    }
    const maybeMaxSelectedOptionsId = maxSelected?.isLimitReached && filteredOptionsUtils.getMaxSelectedOptionsId(id);

    return cl(activeOption, maybeMaxSelectedOptionsId, partialAriaDescribedBy) || undefined;
  }, [maxSelected?.isLimitReached, value, partialAriaDescribedBy, filteredOptions, id]);

  const currentOption = useMemo(
    () => filteredOptionsMap[virtualFocus.activeElement?.getAttribute("id") || -1],
    [filteredOptionsMap, virtualFocus],
  );

  const activeDecendantId = useMemo(
    () => virtualFocus.activeElement?.getAttribute("id") || undefined,
    [virtualFocus.activeElement],
  );

  const filteredOptionsState = {
    activeDecendantId,
    setFilteredOptionsRef,
    filteredOptions,
    isMouseLastUsedInputDevice,
    setIsMouseLastUsedInputDevice,
    isValueNew,
    currentOption,
    virtualFocus,
    ariaDescribedBy,
  };

  return <FilteredOptionsContextProvider {...filteredOptionsState}>{children}</FilteredOptionsContextProvider>;
};

export { FilteredOptionsProvider, useFilteredOptionsContext };
