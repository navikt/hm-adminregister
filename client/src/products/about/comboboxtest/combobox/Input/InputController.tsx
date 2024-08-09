/* eslint-disable jsx-a11y/no-static-element-interactions */
import { forwardRef } from "react";
import { XMarkIcon } from "@navikt/aksel-icons";
import { useMergeRefs } from "../../util";
import SelectedOptions from "../SelectedOptions/SelectedOptions";
import { useSelectedOptionsContext } from "../SelectedOptions/selectedOptionsContext";
import { ComboboxProps } from "../types";
import Input from "./Input";
import { useInputContext } from "./Input.context";

/* eslint-disable jsx-a11y/click-events-have-key-events */
export const InputController = forwardRef<
  HTMLInputElement,
  Omit<ComboboxProps, "label" | "description" | "hideLabel" | "onChange" | "options" | "onClear" | "value">
>(function InputController(props, ref) {
  const { clearButton = true, clearButtonLabel, inputClassName, ...rest } = props;

  const { clearInput, focusInput, inputProps, value, inputRef } = useInputContext();

  const { selectedOptions } = useSelectedOptionsContext();

  const mergedInputRef = useMergeRefs(inputRef, ref);

  return (
    <div className={"navds-combobox__wrapper-inner navds-text-field__input"} onClick={focusInput}>
      <SelectedOptions selectedOptions={selectedOptions}>
        <Input id={inputProps.id} ref={mergedInputRef} inputClassName={inputClassName} {...rest} />
      </SelectedOptions>
      <div>
        {value && clearButton && (
          <button type="button" onClick={clearInput} className="navds-combobox__button-clear" tabIndex={-1}>
            <span className="navds-sr-only">{clearButtonLabel ? clearButtonLabel : "Tøm"}</span>
            <XMarkIcon aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
});
