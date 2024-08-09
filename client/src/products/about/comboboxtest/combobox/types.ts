import React, { InputHTMLAttributes } from "react";
import { FormFieldProps } from "../useFormField";

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

export type MaxSelected = {
  /**
   * The limit for maximum selected options
   */
  limit: number;
  /**
   * Override the message to display when the limit for maximum selected options has been reached
   */
  message?: string;
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
   * Optionally hide the label visually.
   * Not recommended, but can be considered for e.g. search fields in the top menu.
   */
  hideLabel?: boolean;
  /**
   * Custom class name for the input field.
   *
   * If used for styling, please consider using tokens instead.
   */
  inputClassName?: string | undefined;
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
   * @param isCustomOption Whether the option comes from user input, instead of from the list
   */
  onToggleSelected?: (option: ComboboxOption["value"], isSelected: boolean, isCustomOption: boolean) => void;
  /**
   * List of selected options.
   *
   * Use this prop when controlling the selected state outside for the component,
   * e.g. for a filter, where options can be toggled elsewhere/programmatically.
   */
  selectedOptions?: string[] | ComboboxOption[];
  /**
   * Options for the maximum number of selected options.
   */
  maxSelected?: MaxSelected;
  /**
   * Set this to override the value of the input field.
   *
   * This converts the input to a controlled input, so you have to use onChange to update the value.
   */
  value?: string;
  /**
   * Initial value of the input field. Only works when the input is uncontrolled.
   */
  defaultValue?: string;
}
