import cl from "clsx";
import React, { forwardRef, InputHTMLAttributes, useCallback, useRef } from "react";
import { omit } from "../../util";
import { useMergeRefs } from "../../util/hooks";
import filteredOptionsUtil from "../FilteredOptions/filtered-options-util";
import { useFilteredOptionsContext } from "../FilteredOptions/filteredOptionsContext";
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
  const {
    activeDecendantId,
    currentOption,
    filteredOptions,
    isValueNew,
    ariaDescribedBy,
    setIsMouseLastUsedInputDevice,
    virtualFocus,
  } = useFilteredOptionsContext();

  const onEnter = useCallback(
    (event: React.KeyboardEvent) => {
      const isTextInSelectedOptions = (text: string) =>
        selectedOptions.some((option) => option.label.toLocaleLowerCase() === text.toLocaleLowerCase());

      if (currentOption) {
        event.preventDefault();
        // Selecting a value from the dropdown / FilteredOptions
        toggleOption(currentOption, event);
      } else if (isTextInSelectedOptions(value)) {
        event.preventDefault();
        // Trying to set the same value that is already set, so just clearing the input
        clearInput(event);
      } else if (value !== "") {
        event.preventDefault();
        // Autocompleting or adding a new value
        const selectedValue = isValueNew ? { label: value, value } : filteredOptions[0];

        if (!selectedValue) {
          return;
        }

        toggleOption(selectedValue, event);
      }
    },
    [clearInput, currentOption, filteredOptions, isValueNew, selectedOptions, toggleOption, value],
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
      setIsMouseLastUsedInputDevice(false);
      if (e.key === "Backspace") {
        if (value === "") {
          const lastSelectedOption = selectedOptions[selectedOptions.length - 1];
          if (lastSelectedOption) {
            removeSelectedOption(lastSelectedOption);
          }
        }
      } else if (e.key === "Enter" || e.key === "Accept") {
        if (activeDecendantId || value) {
          e.preventDefault();
        }
      } else if (e.key === "Escape") {
        if (value) {
          e.preventDefault(); // Prevents closing an encasing Modal, as Combobox reacts on keyup.
          clearInput(e);
        }
      }
    },
    [
      value,
      selectedOptions,
      removeSelectedOption,
      activeDecendantId,
      setIsMouseLastUsedInputDevice,
      clearInput,
      onChange,
      virtualFocus,
      setValue,
    ],
  );

  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      virtualFocus.moveFocusToTop();
      onChange(newValue);
    },
    [filteredOptions.length, virtualFocus, onChange],
  );

  return (
    <input
      {...rest}
      {...omit(inputProps, ["aria-invalid"])}
      ref={mergedRefs}
      value={value}
      onBlur={() => virtualFocus.moveFocusToTop()}
      onClick={() => onChange(value)}
      onInput={onChangeHandler}
      type="text"
      onKeyUp={handleKeyUp}
      onKeyDown={handleKeyDown}
      aria-controls={filteredOptionsUtil.getFilteredOptionsId(inputProps.id)}
      autoComplete="off"
      aria-activedescendant={activeDecendantId}
      aria-describedby={ariaDescribedBy}
      aria-invalid={inputProps["aria-invalid"]}
      className={cl(inputClassName, "navds-combobox__input", "navds-body-short", `navds-body-short--${size}`)}
    />
  );
});

export default Input;
