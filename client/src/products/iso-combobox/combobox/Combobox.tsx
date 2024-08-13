import { forwardRef } from "react";
import ComboboxWrapper from "./ComboboxWrapper";
import FilteredOptions from "./FilteredOptions/FilteredOptions";
import { useFilteredOptionsContext } from "./FilteredOptions/filteredOptionsContext";
import { useInputContext } from "./Input/Input.context";
import { InputController } from "./Input/InputController";
import { ComboboxProps } from "./types";
import { BodyShort, ErrorMessage, Label } from "@navikt/ds-react";

export const Combobox = forwardRef<HTMLInputElement, Omit<ComboboxProps, "onChange" | "options" | "onClear" | "value">>(
  function Combobox(props, ref) {
    const { className, description, label, ...rest } = props;

    const { toggleIsListOpen } = useFilteredOptionsContext();

    const { error, errorId, hasError, inputDescriptionId, inputProps, showErrorMsg } = useInputContext();

    return (
      <ComboboxWrapper className={className} hasError={hasError} toggleIsListOpen={toggleIsListOpen}>
        <Label htmlFor={inputProps.id} className={"navds-form-field__label"}>
          {label}
        </Label>
        {!!description && (
          <BodyShort as="div" className={"navds-form-field__description"} id={inputDescriptionId}>
            {description}
          </BodyShort>
        )}
        <div className="navds-combobox__wrapper">
          <InputController ref={ref} {...rest} />
          <FilteredOptions />
        </div>
        <div className="navds-form-field__error" id={errorId} aria-relevant="additions removals" aria-live="polite">
          {showErrorMsg && <ErrorMessage>{error}</ErrorMessage>}
        </div>
      </ComboboxWrapper>
    );
  },
);

export default Combobox;
