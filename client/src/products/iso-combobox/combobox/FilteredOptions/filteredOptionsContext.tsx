import cl from "clsx";
import React, { SetStateAction, useCallback, useMemo, useState } from "react";
import { createContext } from "../../util/create-context";
import { useClientLayoutEffect, usePrevious } from "../../util/hooks";
import { useInputContext } from "../Input/Input.context";
import { useSelectedOptionsContext } from "../SelectedOptions/selectedOptionsContext";
import { ComboboxOption, ComboboxProps } from "../types";
import filteredOptionsUtils from "./filtered-options-util";
import useVirtualFocus, { VirtualFocusType } from "./useVirtualFocus";

type FilteredOptionsProps = {
  children: React.ReactNode;
  value: Pick<ComboboxProps, "isListOpen" | "isLoading"> & {
    filteredOptions?: ComboboxOption[];
    options: ComboboxOption[];
  };
};

type FilteredOptionsContextValue = {
  activeDecendantId?: string;
  ariaDescribedBy?: string;
  setFilteredOptionsRef: React.Dispatch<React.SetStateAction<HTMLUListElement | null>>;
  isListOpen: boolean;
  isLoading?: boolean;
  filteredOptions: ComboboxOption[];
  isMouseLastUsedInputDevice: boolean;
  setIsMouseLastUsedInputDevice: React.Dispatch<SetStateAction<boolean>>;
  toggleIsListOpen: (newState?: boolean) => void;
  currentOption?: ComboboxOption;
  virtualFocus: VirtualFocusType;
};
const [FilteredOptionsContextProvider, useFilteredOptionsContext] = createContext<FilteredOptionsContextValue>({
  name: "FilteredOptionsContext",
  errorMessage: "useFilteredOptionsContext must be used within a FilteredOptionsProvider",
});

const FilteredOptionsProvider = ({ children, value: props }: FilteredOptionsProps) => {
  const { filteredOptions: externalFilteredOptions, isListOpen: isExternalListOpen, isLoading, options } = props;
  const [filteredOptionsRef, setFilteredOptionsRef] = useState<HTMLUListElement | null>(null);
  const virtualFocus = useVirtualFocus(filteredOptionsRef);
  const {
    inputProps: { "aria-describedby": partialAriaDescribedBy, id },
    value,
    searchTerm,
    setValue,
    setSearchTerm,
  } = useInputContext();
  const { maxSelected } = useSelectedOptionsContext();

  const [isInternalListOpen, setInternalListOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    if (externalFilteredOptions) {
      return externalFilteredOptions;
    }
    return filteredOptionsUtils.getMatchingValuesFromList(searchTerm, options);
  }, [externalFilteredOptions, options, searchTerm]);

  const previousSearchTerm = usePrevious(searchTerm);

  const [isMouseLastUsedInputDevice, setIsMouseLastUsedInputDevice] = useState(false);

  const filteredOptionsMap = useMemo(() => {
    const initialMap = {
      // eslint-disable-next-line react/prop-types
      ...options.reduce((acc, option) => {
        const _id = filteredOptionsUtils.getOptionId(id, option.label);
        // @ts-expect-error ukjent
        acc[_id] = option;
        return acc;
      }, {}),
    };
    // Add the options to the map
    // eslint-disable-next-line react/prop-types
    return options.reduce((map, _option) => {
      const _id = filteredOptionsUtils.getOptionId(id, _option.label);
      // @ts-expect-error ukjent
      map[_id] = _option;
      return map;
    }, initialMap);
  }, [id, options, value]);

  useClientLayoutEffect(() => {
    if ((previousSearchTerm?.length || 0) < searchTerm.length) {
      setValue(`${searchTerm}`);
    }
  }, [filteredOptions, previousSearchTerm, searchTerm, setSearchTerm, setValue]);

  const isListOpen = useMemo(() => {
    return isExternalListOpen ?? isInternalListOpen;
  }, [isExternalListOpen, isInternalListOpen]);

  const toggleIsListOpen = useCallback(
    (newState?: boolean) => {
      virtualFocus.moveFocusToTop();
      setInternalListOpen((oldState) => newState ?? !oldState);
    },
    [virtualFocus],
  );

  const ariaDescribedBy = useMemo(() => {
    let activeOption: string = "";
    if (!isLoading && filteredOptions.length === 0) {
      activeOption = filteredOptionsUtils.getNoHitsId(id);
    } else if (value || isLoading) {
      if (isListOpen && isLoading) {
        activeOption = filteredOptionsUtils.getIsLoadingId(id);
      }
    }
    const maybeMaxSelectedOptionsId = maxSelected?.isLimitReached && filteredOptionsUtils.getMaxSelectedOptionsId(id);

    return cl(activeOption, maybeMaxSelectedOptionsId, partialAriaDescribedBy) || undefined;
  }, [isListOpen, isLoading, maxSelected?.isLimitReached, value, partialAriaDescribedBy, filteredOptions, id]);

  const currentOption = useMemo(
    // @ts-expect-error ukjent
    () => filteredOptionsMap[virtualFocus.activeElement?.getAttribute("id") || -1],
    [filteredOptionsMap, virtualFocus,
  );

  const activeDecendantId = useMemo(
    () => virtualFocus.activeElement?.getAttribute("id") || undefined,
    [virtualFocus.activeElement],
  );

  const filteredOptionsState = {
    activeDecendantId,
    setFilteredOptionsRef,
    isListOpen,
    isLoading,
    filteredOptions,
    isMouseLastUsedInputDevice,
    setIsMouseLastUsedInputDevice,
    toggleIsListOpen,
    currentOption,
    virtualFocus,
    ariaDescribedBy,
  };

  return <FilteredOptionsContextProvider {...filteredOptionsState}>{children}</FilteredOptionsContextProvider>;
};

export { FilteredOptionsProvider, useFilteredOptionsContext };
