import cl from "clsx";
import { CheckmarkIcon } from "@navikt/aksel-icons";
import { useInputContext } from "felleskomponenter/comboboxfelles/Input/Input.context";
import { isInList } from "felleskomponenter/comboboxfelles/combobox-utils";
import filteredOptionsUtil from "./filtered-options-util";
import { useFilteredOptionsContext } from "./filteredOptionsContext";
import { BodyShort, Loader } from "@navikt/ds-react";
import { useSelectedOptionsContext } from "felleskomponenter/comboboxfelles/SelectedOptions/selectedOptionsContext";

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
  const { selectedOptions, toggleOption } = useSelectedOptionsContext();

  const shouldRenderNonSelectables =
    isLoading || // Render loading message
    (!isLoading && filteredOptions.length === 0); // Render no hits message

  const shouldRenderFilteredOptionsList = filteredOptions.length > 0; // Render filtered options

  return (
    <div
      className={cl("aksel-combobox__list", {
        "aksel-combobox__list--closed": !isListOpen,
        "aksel-combobox__list--with-hover": isMouseLastUsedInputDevice,
      })}
      id={filteredOptionsUtil.getFilteredOptionsId(id)}
      tabIndex={-1}
    >
      {shouldRenderNonSelectables && (
        <div className="aksel-combobox__list_non-selectables" role="status">
          {isLoading && (
            <div className="aksel-combobox__list-item--loading" id={filteredOptionsUtil.getIsLoadingId(id)}>
              <Loader title="Søker..." />
            </div>
          )}
          {!isLoading && filteredOptions.length === 0 && (
            <div className="aksel-combobox__list-item--no-options" id={filteredOptionsUtil.getNoHitsId(id)}>
              Ingen søketreff
            </div>
          )}
        </div>
      )}

      {shouldRenderFilteredOptionsList && (
        <ul ref={setFilteredOptionsRef} role="listbox" className="aksel-combobox__list-options">
          {filteredOptions.map((option) => (
            <li
              className={cl("aksel-combobox__list-item", {
                "aksel-combobox__list-item--focus":
                  activeDecendantId === filteredOptionsUtil.getOptionId(id, option.label),
                "aksel-combobox__list-item--selected": isInList(option.value, selectedOptions),
              })}
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
                toggleOption(option, event);
                if (!isInList(option.value, selectedOptions)) {
                  toggleIsListOpen(false);
                }
              }}
              role="option"
              aria-selected={isInList(option.value, selectedOptions)}
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
