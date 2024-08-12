/* eslint-disable jsx-a11y/no-static-element-interactions */
import cl from "clsx";
import { forwardRef } from "react";
import { XMarkIcon } from "@navikt/aksel-icons";
import { useMergeRefs } from "../../util/hooks";
import { useFilteredOptionsContext } from "../FilteredOptions/filteredOptionsContext";
import SelectedOptions from "../SelectedOptions/SelectedOptions";
import { useSelectedOptionsContext } from "../SelectedOptions/selectedOptionsContext";
import { ComboboxProps } from "../types";
import Input from "./Input";
import { useInputContext } from "./Input.context";
import ToggleListButton from "./ToggleListButton";

/* eslint-disable jsx-a11y/click-events-have-key-events */
export const InputController = forwardRef<
  HTMLInputElement,
  Omit<ComboboxProps, "label" | "description" | "hideLabel" | "onChange" | "options" | "onClear" | "value">
>(function InputController(props, ref) {
  const { inputClassName, ...rest } = props;

  const { clearInput, focusInput, inputProps, value, inputRef, toggleOpenButtonRef } = useInputContext();

  const { activeDecendantId } = useFilteredOptionsContext();
  const { selectedOptions, removeSelectedOption } = useSelectedOptionsContext();

  const mergedInputRef = useMergeRefs(inputRef, ref);

  // @ts-expect-error event
  const clearField = (event) => {
    clearInput(event);
    removeSelectedOption(selectedOptions[0]);
  };

  return (
    <div
      className={cl("navds-combobox__wrapper-inner navds-text-field__input", {
        "navds-combobox__wrapper-inner--virtually-unfocused": activeDecendantId !== undefined,
      })}
      onClick={focusInput}
    >
      <SelectedOptions selectedOptions={selectedOptions}>
        <Input id={inputProps.id} ref={mergedInputRef} inputClassName={inputClassName} {...rest} />
      </SelectedOptions>
      <div>
        {(value || selectedOptions.length > 0) && (
          <button type="button" onClick={clearField} className="navds-combobox__button-clear" tabIndex={-1}>
            <span className="navds-sr-only">{"Tøm"}</span>
            <XMarkIcon aria-hidden />
          </button>
        )}
        <ToggleListButton ref={toggleOpenButtonRef} />
      </div>
    </div>
  );
});
