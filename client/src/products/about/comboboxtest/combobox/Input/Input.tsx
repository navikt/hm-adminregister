import cl from "clsx";
import React, { forwardRef, InputHTMLAttributes, useCallback, useRef } from "react";
import { omit } from "../../util";
import { useMergeRefs } from "../../util";
import { useSelectedOptionsContext } from "../SelectedOptions/selectedOptionsContext";
import { useInputContext } from "./Input.context";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "disabled"> {
  ref: React.Ref<HTMLInputElement>;
  inputClassName?: string;
  value?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ inputClassName, ...rest }, ref) {
  const internalRef = useRef<HTMLInputElement>(null);
  const mergedRefs = useMergeRefs(ref, internalRef);
  const { clearInput, inputProps, onChange, size, value, setValue } = useInputContext();
  const { selectedOptions, removeSelectedOption, toggleOption } = useSelectedOptionsContext();

  const onEnter = useCallback(
    (event: React.KeyboardEvent) => {
      const isTextInSelectedOptions = (text: string) =>
        selectedOptions.some((option) => option.label.toLocaleLowerCase() === text.toLocaleLowerCase());

      if (isTextInSelectedOptions(value)) {
        event.preventDefault();
        // Trying to set the same value that is already set, so just clearing the input
        clearInput(event);
      } else if (value !== "") {
        event.preventDefault();
        // Autocompleting or adding a new value
        const selectedValue = { label: value, value };
        toggleOption(selectedValue, event);
      }
    },
    [clearInput, selectedOptions, toggleOption, value],
  );

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    switch (e.key) {
      case "Enter":
      case "Accept":
        onEnter(e);
        break;
      default:
        break;
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (value === "") {
          const lastSelectedOption = selectedOptions[selectedOptions.length - 1];
          if (lastSelectedOption) {
            removeSelectedOption(lastSelectedOption);
          }
        }
      } else if (e.key === "Enter" || e.key === "Accept") {
        if (value) {
          e.preventDefault();
        }
      } else if (e.key === "Escape") {
        if (value) {
          e.preventDefault(); // Prevents closing an encasing Modal, as Combobox reacts on keyup.
          clearInput(e);
        }
      }
    },
    [value, selectedOptions, removeSelectedOption, clearInput, onChange, setValue],
  );

  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      onChange(newValue);
    },
    [onChange,
  );

  return (
    <input
      {...rest}
      {...omit(inputProps, ["aria-invalid"])}
      ref={mergedRefs}
      value={value}
      onClick={() => onChange(value)}
      onInput={onChangeHandler}
      type="text"
      onKeyUp={handleKeyUp}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      aria-invalid={inputProps["aria-invalid"]}
      className={cl(inputClassName, "navds-combobox__input", "navds-body-short", `navds-body-short--${size}`)}
    />
  );
});

export default Input;
