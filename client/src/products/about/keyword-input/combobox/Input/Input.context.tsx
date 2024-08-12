import React, { useCallback, useMemo, useRef, useState } from "react";
import { createContext } from "../../util/create-context";
import { FormFieldType, useFormField } from "../../formfield/useFormField";
import { ComboboxProps } from "../types";

interface InputContextValue extends FormFieldType {
  clearInput: NonNullable<ComboboxProps["onClear"]>;
  error?: ComboboxProps["error"];
  focusInput: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  setValue: (text: string) => void;
  onChange: (newValue: string) => void;
}

const [InputContextProvider, useInputContext] = createContext<InputContextValue>({
  name: "InputContext",
  errorMessage: "useInputContext must be used within an InputContextProvider",
});

interface Props {
  children: React.ReactNode;
  value: {
    defaultValue: ComboboxProps["defaultValue"];
    description: ComboboxProps["description"];
    error: ComboboxProps["error"];
    errorId: ComboboxProps["errorId"];
    id: ComboboxProps["id"];
    value: ComboboxProps["value"];
    onChange: ComboboxProps["onChange"];
    onClear: ComboboxProps["onClear"];
  };
}

const InputProvider = ({ children, value: props }: Props) => {
  const {
    defaultValue = "",
    description,
    error,
    errorId,
    id: externalId,
    value: externalValue,
    onChange: externalOnChange,
    onClear,
  } = props;
  const formFieldProps = useFormField(
    {
      description,
      error,
      errorId,
      id: externalId,
    },
    "comboboxfield",
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internalValue, setInternalValue] = useState<string>(defaultValue);

  const value = useMemo(() => String(externalValue ?? internalValue), [externalValue, internalValue]);

  const onChange = useCallback(
    (newValue: string) => {
      externalValue ?? setInternalValue(newValue);
      externalOnChange?.(newValue);
    },
    [externalValue, externalOnChange],
  );

  const clearInput = useCallback(
    (event: React.PointerEvent | React.KeyboardEvent | React.MouseEvent) => {
      onClear?.(event);
      externalOnChange?.("");
      setInternalValue("");
    },
    [externalOnChange, onClear, setInternalValue],
  );

  const focusInput = useCallback(() => {
    inputRef.current?.focus?.();
  }, []);

  const contextValue = {
    ...formFieldProps,
    clearInput,
    error,
    focusInput,
    inputRef,
    value,
    setValue: setInternalValue,
    onChange,
  };

  return <InputContextProvider {...contextValue}>{children}</InputContextProvider>;
};

export { InputProvider as InputContextProvider, useInputContext };