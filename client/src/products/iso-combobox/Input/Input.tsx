import cl from "clsx";
import React, { forwardRef, InputHTMLAttributes, useCallback, useRef } from "react";
import { omit, useMergeRefs } from "felleskomponenter/comboboxfelles/utils";
import filteredOptionsUtil from "../FilteredOptions/filtered-options-util";
import { useFilteredOptionsContext } from "../FilteredOptions/filteredOptionsContext";
import { useInputContext } from "felleskomponenter/comboboxfelles/Input/Input.context";
import { useSelectedOptionsContext } from "felleskomponenter/comboboxfelles/SelectedOptions/selectedOptionsContext";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value"> {
  ref: React.Ref<HTMLInputElement>;
  value?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ ...rest }, ref) {
  const internalRef = useRef<HTMLInputElement>(null);
  const mergedRefs = useMergeRefs(ref, internalRef);
  const { clearInput, inputProps, onChange, value, searchTerm, setValue } = useInputContext();
  const { selectedOptions, removeSelectedOption, toggleOption } = useSelectedOptionsContext();
  const {
    activeDecendantId,
    currentOption,
    filteredOptions,
    toggleIsListOpen,
    isListOpen,
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
        if (!isTextInSelectedOptions(currentOption.label)) {
          toggleIsListOpen(false);
        }
      } else if (isTextInSelectedOptions(value)) {
        event.preventDefault();
        // Trying to set the same value that is already set, so just clearing the input
        clearInput(event);
      }
    },
    [clearInput, currentOption, filteredOptions, selectedOptions, toggleIsListOpen, toggleOption, value],
  );

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    switch (e.key) {
      case "Enter":
      case "Accept":
        onEnter(e);
        break;
      case "Home":
        toggleIsListOpen(false);
        virtualFocus.moveFocusToTop();
        break;
      case "End":
        toggleIsListOpen(true);
        virtualFocus.moveFocusToBottom();
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
        if (isListOpen || value) {
          e.preventDefault(); // Prevents closing an encasing Modal, as Combobox reacts on keyup.
          clearInput(e);
          toggleIsListOpen(false);
        }
      } else if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
        /**
         * In case user has an active selection and 'completes' the selection with ArrowLeft or ArrowRight
         * we need to make sure to update the filter.
         */
        if (value !== "" && value !== searchTerm) {
          onChange(value);
        }
      } else if (e.key === "ArrowDown") {
        // Reset the value to the search term to cancel autocomplete
        // if the user moves focus down to the FilteredOptions
        if (value !== searchTerm) {
          setValue(searchTerm);
        }
        if (virtualFocus.activeElement === null || !isListOpen) {
          toggleIsListOpen(true);
        }
        virtualFocus.moveFocusDown();
      } else if (e.key === "ArrowUp") {
        if (value !== "" && value !== searchTerm) {
          onChange(value);
        }
        // Check that the FilteredOptions list is open and has virtual focus.
        // Otherwise ignore keystrokes, so it doesn't interfere with text editing
        if (isListOpen && activeDecendantId) {
          e.preventDefault();
          if (virtualFocus.isFocusOnTheTop()) {
            toggleIsListOpen(false);
          }
          virtualFocus.moveFocusUp();
        }
      }
    },
    [
      value,
      selectedOptions,
      removeSelectedOption,
      isListOpen,
      activeDecendantId,
      setIsMouseLastUsedInputDevice,
      clearInput,
      toggleIsListOpen,
      onChange,
      virtualFocus,
      setValue,
      searchTerm,
    ],
  );

  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      if (newValue && newValue !== "") {
        toggleIsListOpen(true);
      } else if (filteredOptions.length === 0) {
        toggleIsListOpen(false);
      }
      virtualFocus.moveFocusToTop();
      onChange(newValue);
    },
    [filteredOptions.length, virtualFocus, onChange, toggleIsListOpen],
  );

  return (
    <input
      {...rest}
      {...omit(inputProps, ["aria-invalid"])}
      ref={mergedRefs}
      value={value}
      onBlur={() => virtualFocus.moveFocusToTop()}
      onClick={() => value !== searchTerm && onChange(value)}
      onInput={onChangeHandler}
      type="text"
      role="combobox"
      onKeyUp={handleKeyUp}
      onKeyDown={handleKeyDown}
      aria-controls={filteredOptionsUtil.getFilteredOptionsId(inputProps.id)}
      aria-expanded={!!isListOpen}
      autoComplete="off"
      aria-autocomplete={"list"}
      aria-activedescendant={activeDecendantId}
      aria-describedby={ariaDescribedBy}
      aria-invalid={inputProps["aria-invalid"]}
      className={cl("navds-combobox__input", "navds-body-short", `navds-body-short--medium`)}
    />
  );
});

export default Input;
