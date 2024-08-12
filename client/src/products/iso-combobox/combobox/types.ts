import React, { InputHTMLAttributes } from "react";
import { FormFieldProps } from "../formfield/useFormField";

/**
 * A more complex version of options for the Combobox.
 * Used for separating the label and the value of the option.
 */
export type ComboboxOption = {
  /**
   * The label to display in the dropdown list
   */
  label: string;
  /**
   * The programmatic value of the option, for use internally. Will be returned from onToggleSelected.
   */
  value: string;
};

export interface ComboboxProps
  extends FormFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  /**
   * Combobox label.
   */
  label: React.ReactNode;
  /**
   * List of options
   */
  options: string[] | ComboboxOption[];
  /**
   * A list of options to display in the dropdown list.
   * If provided, this overrides the internal search logic in the component.
   * Useful for e.g. searching on a server or when overriding the search algorithm to search for synonyms or similar.
   */
  filteredOptions?: string[] | ComboboxOption[];
  /**
   * Custom class name for the input field.
   *
   * If used for styling, please consider using tokens instead.
   */
  inputClassName?: string | undefined;
  /**
   * Controlled open/closed state for the dropdown list
   */
  isListOpen?: boolean;
  /**
   * Set to `true` when doing an async search and waiting for new filteredOptions.
   *
   * Will show a spinner in the dropdown and announce to screen readers that it is loading.
   */
  isLoading?: boolean;
  /**
   * Callback function triggered whenever the value of the input field is triggered.
   *
   * @param value The value after change
   */
  onChange?: (value: string) => void;
  /**
   * Callback function triggered whenever the input field is cleared.
   *
   * @param event
   */
  onClear?: (event: React.PointerEvent | React.KeyboardEvent | React.MouseEvent) => void;
  /**
   * Callback function triggered whenever an option is selected or de-selected.
   *
   * @param option The option value
   * @param isSelected Whether the option has been selected or unselected
   */
  onToggleSelected?: (option: ComboboxOption["value"], isSelected: boolean) => void;
  /**
   * List of selected options.
   *
   * Use this prop when controlling the selected state outside for the component,
   * e.g. for a filter, where options can be toggled elsewhere/programmatically.
   */
  selectedOptions?: string[] | ComboboxOption[];
  /**
   * Set this to override the value of the input field.
   *
   * This converts the input to a controlled input, so you have to use onChange to update the value.
   */
  value?: string;
}
