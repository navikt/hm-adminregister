import cl from "clsx";
import { forwardRef } from "react";
import ComboboxWrapper from "felleskomponenter/comboboxfelles/ComboboxWrapper";
import { useInputContext } from "felleskomponenter/comboboxfelles/Input/Input.context";
import { BodyShort, ErrorMessage, Label } from "@navikt/ds-react";
import { ComboboxProps } from "felleskomponenter/comboboxfelles/types";

export const Combobox = forwardRef<HTMLInputElement, Omit<ComboboxProps, "onChange" | "options" | "onClear" | "value">>(
  function Combobox(props) {
    const { children, toggleIsListOpen, className, hideLabel = false, description, label } = props;
    const { error, errorId, hasError, inputDescriptionId, inputProps, showErrorMsg } = useInputContext();

    return (
      <ComboboxWrapper className={className} hasError={hasError} toggleIsListOpen={toggleIsListOpen}>
        <Label
          htmlFor={inputProps.id}
          className={cl("navds-form-field__label", {
            "navds-sr-only": hideLabel,
          })}
        >
          {label}
        </Label>
        <>
          {!!description && (
            <BodyShort
              as="div"
              className={cl("navds-form-field__description", {
                "navds-sr-only": hideLabel,
              })}
              id={inputDescriptionId}
            >
              {description}
            </BodyShort>
          )}
        </>
        <div className="navds-combobox__wrapper">{children}</div>
        <div className="navds-form-field__error" id={errorId} aria-relevant="additions removals" aria-live="polite">
          {showErrorMsg && <ErrorMessage>{error}</ErrorMessage>}
        </div>
      </ComboboxWrapper>
    );
  },
);

export default Combobox;
