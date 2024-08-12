import React, { InputHTMLAttributes } from "react";
import { FormFieldProps } from "../formfield/useFormField";

export type ComboboxOption = {
  label: string;
  value: string;
};

export interface ComboboxProps
  extends FormFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue"> {
  label: React.ReactNode;
  options: string[] | ComboboxOption[];
  filteredOptions?: string[] | ComboboxOption[];
  inputClassName?: string | undefined;
  isListOpen?: boolean;
  isLoading?: boolean;
  onChange?: (value: string) => void;
  onClear?: (event: React.PointerEvent | React.KeyboardEvent | React.MouseEvent) => void;
  onToggleSelected?: (option: ComboboxOption["value"], isSelected: boolean) => void;
  selectedOptions?: string[] | ComboboxOption[];
  value?: string;
}
