import cl from "clsx";
import React, { useContext } from "react";
import { useId } from "../util/hooks";
import { FieldsetContext } from "./context";

export interface FormFieldProps {
  /**
   * Error message.
   */
  error?: React.ReactNode;
  /**
   * Adds a description to extend the labeling.
   */
  description?: React.ReactNode;
  /**
   * Override internal id.
   */
  id?: string;
  /**
   * Read-only state.
   */
  readOnly?: boolean;
  "aria-describedby"?: string;
}

export interface FormFieldType {
  showErrorMsg: boolean;
  hasError: boolean;
  errorId: string;
  inputDescriptionId: string;
  inputProps: {
    id: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  };
  readOnly?: boolean;
}

/**
 * Handles props and their state for various form-fields in context with Fieldset
 */
export const useFormField = (props: FormFieldProps, prefix: string): FormFieldType => {
  const { error } = props;

  const fieldset = useContext(FieldsetContext);

  const genId = useId();

  const id = props.id ?? `${prefix}-${genId}`;
  const errorId = `${prefix}-error-${genId}`;
  const inputDescriptionId = `${prefix}-description-${genId}`;

  const readOnly = fieldset?.readOnly || props.readOnly || undefined;

  const hasError: boolean = !readOnly && !!(error || fieldset?.error);
  const showErrorMsg = !readOnly && !!error && typeof error !== "boolean";

  const ariaInvalid = { ...(hasError ? { "aria-invalid": true } : {}) };

  if ((props as any)?.required && process.env.NODE_ENV !== "production") {
    console.warn("Aksel: Use of 'required' in form-elements is heavily discuouraged. Docs about why here:");
    console.warn("https://aksel.nav.no/god-praksis/artikler/obligatoriske-og-valgfrie-skjemafelter#h3bfe00453471");
  }

  return {
    showErrorMsg,
    hasError,
    errorId,
    inputDescriptionId,
    readOnly,
    inputProps: {
      id,
      ...ariaInvalid,
      "aria-describedby":
        cl(props["aria-describedby"], {
          [inputDescriptionId]: !!props?.description && typeof props?.description === "string",
          [errorId]: showErrorMsg,
          [fieldset?.errorId ?? ""]: hasError && !!fieldset?.error,
        }) || undefined,
    },
  };
};
