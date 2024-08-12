import cl from "clsx";
import { CheckmarkIcon } from "@navikt/aksel-icons";
import { useInputContext } from "../Input/Input.context";
import { useSelectedOptionsContext } from "../SelectedOptions/selectedOptionsContext";
import { isInList } from "../combobox-utils";
import { ComboboxOption } from "../types";
import filteredOptionsUtil from "./filtered-options-util";
import { useFilteredOptionsContext } from "./filteredOptionsContext";
import { BodyShort, Loader } from "@navikt/ds-react";

const FilteredOptions = () => {
  const {
    inputProps: { id },
  } = useInputContext();
  const {
    isLoading,
    isListOpen,
    filteredOptions,
    setFilteredOptionsRef,
    isMouseLastUsedInputDevice,
    setIsMouseLastUsedInputDevice,
    toggleIsListOpen,
    activeDecendantId,
    virtualFocus,
  } = useFilteredOptionsContext();
  const { selectedOptions, toggleOption, maxSelected } = useSelectedOptionsContext();

  const isDisabled = (option: ComboboxOption) =>
    maxSelected?.isLimitReached && !isInList(option.value, selectedOptions);

  const shouldRenderNonSelectables =
    maxSelected?.isLimitReached || // Render maxSelected message
    isLoading || // Render loading message
    (!isLoading && filteredOptions.length === 0); // Render no hits message

  const shouldRenderFilteredOptionsList = filteredOptions.length > 0; // Render filtered options

  return (
    <div
      className={cl("navds-combobox__list", {
        "navds-combobox__list--closed": !isListOpen,
        "navds-combobox__list--with-hover": isMouseLastUsedInputDevice,
      })}
      id={filteredOptionsUtil.getFilteredOptionsId(id)}
      tabIndex={-1}
    >
      {shouldRenderNonSelectables && (
        <div className="navds-combobox__list_non-selectables" role="status">
          {maxSelected?.isLimitReached && (
            <div
              className="navds-combobox__list-item--max-selected"
              id={filteredOptionsUtil.getMaxSelectedOptionsId(id)}
            >
              {`${selectedOptions.length} av 1 er valgt.`}
            </div>
          )}
          {isLoading && (
            <div className="navds-combobox__list-item--loading" id={filteredOptionsUtil.getIsLoadingId(id)}>
              <Loader title="Søker..." />
            </div>
          )}
          {!isLoading && filteredOptions.length === 0 && (
            <div className="navds-combobox__list-item--no-options" id={filteredOptionsUtil.getNoHitsId(id)}>
              Ingen søketreff
            </div>
          )}
        </div>
      )}

      {shouldRenderFilteredOptionsList && (
        <ul ref={setFilteredOptionsRef} role="listbox" className="navds-combobox__list-options">
          {filteredOptions.map((option) => (
            <li
              className={cl("navds-combobox__list-item", {
                "navds-combobox__list-item--focus":
                  activeDecendantId === filteredOptionsUtil.getOptionId(id, option.label),
                "navds-combobox__list-item--selected": isInList(option.value, selectedOptions),
              })}
              data-no-focus={isDisabled(option) || undefined}
              id={filteredOptionsUtil.getOptionId(id, option.label)}
              key={option.label}
              tabIndex={-1}
              onMouseMove={() => {
                if (activeDecendantId !== filteredOptionsUtil.getOptionId(id, option.label)) {
                  virtualFocus.moveFocusToElement(filteredOptionsUtil.getOptionId(id, option.label));
                  setIsMouseLastUsedInputDevice(true);
                }
              }}
              onPointerUp={(event) => {
                if (isDisabled(option)) {
                  return;
                }
                toggleOption(option, event);
                if (!isInList(option.value, selectedOptions)) {
                  toggleIsListOpen(false);
                }
              }}
              role="option"
              aria-selected={isInList(option.value, selectedOptions)}
              aria-disabled={isDisabled(option) || undefined}
            >
              <BodyShort>{option.label}</BodyShort>
              {isInList(option.value, selectedOptions) && <CheckmarkIcon />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilteredOptions;
