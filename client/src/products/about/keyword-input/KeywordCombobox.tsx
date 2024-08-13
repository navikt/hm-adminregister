import { forwardRef } from "react";
import { ComboboxProps } from "felleskomponenter/comboboxfelles/types";
import Combobox from "felleskomponenter/comboboxfelles/Combobox";
import { InputController } from "products/about/keyword-input/Input/InputController";

export const KeywordCombobox = forwardRef<
  HTMLInputElement,
  Omit<ComboboxProps, "onChange" | "options" | "onClear" | "value">
>(function KeywordCombobox(props, ref) {
  const { hideLabel, ...rest } = props;

  return (
    <Combobox {...props}>
      <InputController ref={ref} {...rest} />
    </Combobox>
  );
});
