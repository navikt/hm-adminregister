import React, { useCallback, useMemo, useRef, useState } from "react";
import { createContext } from "felleskomponenter/comboboxfelles/utils/create-context";
import { FormFieldType, useFormField } from "felleskomponenter/comboboxfelles/formfield/useFormField";
import { ComboboxProps } from "felleskomponenter/comboboxfelles/types";

interface InputContextValue extends FormFieldType {
  clearInput: NonNullable<ComboboxProps["onClear"]>;
  error?: ComboboxProps["error"];
  focusInput: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  setValue: (text: string) => void;
  onChange: (newValue: string) => void;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  toggleOpenButtonRef: React.RefObject<HTMLButtonElement>;
}

const [InputContextProvider, useInputContext] = createContext<InputContextValue>({
  name: "InputContext",
  errorMessage: "useInputContext must be used within an InputContextProvider",
});

interface Props {
  children: React.ReactNode;
  value: {
    description: ComboboxProps["description"];
    error: ComboboxProps["error"];
    id: ComboboxProps["id"];
    value: ComboboxProps["value"];
    onChange: ComboboxProps["onChange"];
    onClear: ComboboxProps["onClear"];
  };
}

const InputProvider = ({ children, value: props }: Props) => {
  const { description, error, id: externalId, value: externalValue, onChange: externalOnChange, onClear } = props;
  const formFieldProps = useFormField(
    {
      description,
      error,
      id: externalId,
    },
    "comboboxfield",
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const toggleOpenButtonRef = useRef<HTMLButtonElement>(null);
  const [internalValue, setInternalValue] = useState<string>("");

  const value = useMemo(() => String(externalValue ?? internalValue), [externalValue, internalValue]);

  const [searchTerm, setSearchTerm] = useState(value);

  const onChange = useCallback(
    (newValue: string) => {
      externalValue ?? setInternalValue(newValue);
      setSearchTerm(newValue);
      externalOnChange?.(newValue);
    },
    [externalValue, externalOnChange],
  );

  const clearInput = useCallback(
    (event: React.PointerEvent | React.KeyboardEvent | React.MouseEvent) => {
      onClear?.(event);
      externalOnChange?.("");
      setInternalValue("");
      setSearchTerm("");
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
    searchTerm,
    setSearchTerm,
    toggleOpenButtonRef,
  };

  return <InputContextProvider {...contextValue}>{children}</InputContextProvider>;
};

export { InputProvider as InputContextProvider, useInputContext };
