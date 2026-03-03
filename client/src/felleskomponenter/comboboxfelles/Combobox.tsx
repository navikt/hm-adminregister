import cl from "clsx";
import { forwardRef } from "react";
import { BodyShort, ErrorMessage, Label } from "@navikt/ds-react";
import ComboboxWrapper from "./ComboboxWrapper";
import { useInputContext } from "./Input/Input.context";
import { ComboboxProps } from "./types";

const Combobox = forwardRef<HTMLInputElement, Omit<ComboboxProps, "onChange" | "options" | "onClear" | "value">>(
  function Combobox(props) {
    const { children, toggleIsListOpen, className, hideLabel = false, description, label } = props;
    const { error, errorId, hasError, inputDescriptionId, inputProps, showErrorMsg } = useInputContext();

    return (
      <ComboboxWrapper className={className} hasError={hasError} toggleIsListOpen={toggleIsListOpen}>
        <Label
          htmlFor={inputProps.id}
          className={cl("aksel-form-field__label", {
            "aksel-sr-only": hideLabel,
          })}
        >
          {label}
        </Label>
        <>
          {!!description && (
            <BodyShort
              as="div"
              className={cl("aksel-form-field__description", {
                "aksel-sr-only": hideLabel,
              })}
              id={inputDescriptionId}
            >
              {description}
            </BodyShort>
          )}
        </>
        <div className="aksel-combobox__wrapper">{children}</div>
        <div className="aksel-form-field__error" id={errorId} aria-relevant="additions removals" aria-live="polite">
          {showErrorMsg && <ErrorMessage>{error}</ErrorMessage>}
        </div>
      </ComboboxWrapper>
    );
  },
);

export default Combobox;
