/* eslint-disable jsx-a11y/no-static-element-interactions */
import { forwardRef } from "react";
import { useMergeRefs } from "felleskomponenter/comboboxfelles/utils";
import SelectedOptions from "../SelectedOptions/SelectedOptions";
import { useSelectedOptionsContext } from "felleskomponenter/comboboxfelles/SelectedOptions/selectedOptionsContext";
import { ComboboxProps } from "felleskomponenter/comboboxfelles/types";
import Input from "./Input";
import { useInputContext } from "felleskomponenter/comboboxfelles/Input/Input.context";

/* eslint-disable jsx-a11y/click-events-have-key-events */
export const InputController = forwardRef<
  HTMLInputElement,
  Omit<ComboboxProps, "label" | "description" | "hideLabel" | "onChange" | "options" | "onClear" | "value">
>(function InputController(props, ref) {
  const { ...rest } = props;

  const { focusInput, inputProps, inputRef } = useInputContext();

  const { selectedOptions } = useSelectedOptionsContext();

  const mergedInputRef = useMergeRefs(inputRef, ref);

  return (
    <div className={"navds-combobox__wrapper-inner navds-text-field__input"} onClick={focusInput}>
      <SelectedOptions selectedOptions={selectedOptions}>
        <Input id={inputProps.id} ref={mergedInputRef} {...rest} />
      </SelectedOptions>
    </div>
  );
});
