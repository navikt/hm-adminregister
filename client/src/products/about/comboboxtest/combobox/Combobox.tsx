import cl from "clsx";
import { forwardRef } from "react";
import ComboboxWrapper from "./ComboboxWrapper";
import { useInputContext } from "./Input/Input.context";
import { InputController } from "./Input/InputController";
import { ComboboxProps } from "./types";
import { BodyShort, ErrorMessage, Label } from "@navikt/ds-react";

export const Combobox = forwardRef<
  HTMLInputElement,
  Omit<ComboboxProps, "onChange" | "options" | "size" | "onClear" | "value" | "disabled">
>((props, ref) => {
  const { className, hideLabel = false, description, label, ...rest } = props;

  const { error, errorId, hasError, inputDescriptionId, inputProps, showErrorMsg, size = "medium" } = useInputContext();

  return (
    <ComboboxWrapper className={className} hasError={hasError} inputProps={inputProps} inputSize={size}>
      <Label
        htmlFor={inputProps.id}
        size={size}
        className={cl("navds-form-field__label", {
          "navds-sr-only": hideLabel,
        })}
      >
        {label}
      </Label>
      {!!description && (
        <BodyShort
          as="div"
          className={cl("navds-form-field__description", {
            "navds-sr-only": hideLabel,
          })}
          id={inputDescriptionId}
          size={size}
        >
          {description}
        </BodyShort>
      )}
      <div className="navds-combobox__wrapper">
        <InputController ref={ref} {...rest} />
      </div>
      <div className="navds-form-field__error" id={errorId} aria-relevant="additions removals" aria-live="polite">
        {showErrorMsg && <ErrorMessage size={size}>{error}</ErrorMessage>}
      </div>
    </ComboboxWrapper>
  );
});

export default Combobox;
