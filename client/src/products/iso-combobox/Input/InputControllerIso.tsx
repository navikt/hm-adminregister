/* eslint-disable jsx-a11y/no-static-element-interactions */
import cl from "clsx";
import { forwardRef, MouseEvent, useEffect, useState } from "react";
import { XMarkIcon } from "@navikt/aksel-icons";
import { useMergeRefs } from "felleskomponenter/comboboxfelles/utils";
import { useFilteredOptionsContext } from "../FilteredOptions/filteredOptionsContext";
import SelectedOptions from "felleskomponenter/comboboxfelles/SelectedOptions/SelectedOptions";
import { IsoBoxProps } from "../types";
import Input from "./Input";
import { useInputContext } from "felleskomponenter/comboboxfelles/Input/Input.context";
import ToggleListButton from "./ToggleListButton";
import { useSelectedOptionsContext } from "felleskomponenter/comboboxfelles/SelectedOptions/selectedOptionsContext";

/* eslint-disable jsx-a11y/click-events-have-key-events */
export const InputControllerIso = forwardRef<
  HTMLInputElement,
  Omit<IsoBoxProps, "label" | "description" | "hideLabel" | "onChange" | "options" | "onClear" | "value">
>(function InputController(props, ref) {
  const { ...rest } = props;

  const { clearInput, focusInput, inputProps, value, inputRef, toggleOpenButtonRef } = useInputContext();
  const { activeDecendantId } = useFilteredOptionsContext();
  const { selectedOptions, removeSelectedOption, maxSelected } = useSelectedOptionsContext();
  const [focusing, setFocusing] = useState(false);

  const mergedInputRef = useMergeRefs(inputRef, ref);

  const clearField = (event: MouseEvent<HTMLButtonElement>) => {
    clearInput(event);
    if (selectedOptions.length > 0) {
      removeSelectedOption(selectedOptions[0]);
    }
    setFocusing(true);
  };

  useEffect(() => {
    if (focusing) {
      focusInput();
      setFocusing(false);
    }
  }, [focusing]);

  return (
    <div
      className={cl("navds-combobox__wrapper-inner navds-text-field__input", {
        "navds-combobox__wrapper-inner--virtually-unfocused": activeDecendantId !== undefined,
      })}
      onClick={focusInput}
    >
      <SelectedOptions selectedOptions={selectedOptions} removable={false}>
        {maxSelected && !maxSelected?.isLimitReached && <Input id={inputProps.id} ref={mergedInputRef} {...rest} />}
      </SelectedOptions>
      <div>
        {(value || selectedOptions.length > 0) && (
          <button
            type="button"
            onClick={clearField}
            onPointerDown={(e) => e.preventDefault()}
            className="navds-combobox__button-clear"
          >
            <span className="navds-sr-only">Tøm</span>
            <XMarkIcon aria-hidden />
          </button>
        )}
        <ToggleListButton ref={toggleOpenButtonRef} />
      </div>
    </div>
  );
});
