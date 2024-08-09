import cl from "clsx";
import React, { useContext } from "react";
import { useId } from "./util";
import { FieldsetContext } from "./context";

export interface FormFieldProps {
  /**
   * Error message.
   */
  error?: React.ReactNode;
  /**
   * Override internal errorId.
   */
  errorId?: string;
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
  const { error, errorId: propErrorId } = props;

  const fieldset = useContext(FieldsetContext);

  const genId = useId();

  const id = props.id ?? `${prefix}-${genId}`;
  const errorId = propErrorId ?? `${prefix}-error-${genId}`;
  const inputDescriptionId = `${prefix}-description-${genId}`;

  const readOnly = fieldset?.readOnly || props.readOnly || undefined;

  const hasError: boolean = !readOnly && !!(error || fieldset?.error);
  const showErrorMsg = !readOnly && !!error && typeof error !== "boolean";

  const ariaInvalid = { ...(hasError ? { "aria-invalid": true } : {}) };

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
