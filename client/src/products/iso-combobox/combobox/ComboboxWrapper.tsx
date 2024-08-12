import cl from "clsx";
import { ReactNode, useRef, useState } from "react";
import { useInputContext } from "./Input/Input.context";

type ComboboxWrapperProps = {
  children: ReactNode;
  className?: string;
  hasError: boolean;
  inputSize: string;
  toggleIsListOpen: (isListOpen: boolean) => void;
};

const ComboboxWrapper = ({ children, className, hasError, inputSize, toggleIsListOpen }: ComboboxWrapperProps) => {
  const { toggleOpenButtonRef } = useInputContext();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);

  // @ts-expect-error event
  function onFocusInsideWrapper(e) {
    if (!wrapperRef.current?.contains(e.relatedTarget) && toggleOpenButtonRef?.current !== e.target) {
      toggleIsListOpen(true);
      setHasFocusWithin(true);
    }
  }

  // @ts-expect-error event
  function onBlurWrapper(e) {
    if (!wrapperRef.current?.contains(e.relatedTarget)) {
      toggleIsListOpen(false);
      setHasFocusWithin(false);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={cl(className, "navds-form-field", `navds-form-field--${inputSize}`, {
        "navds-combobox--error": hasError,
        "navds-combobox--focused": hasFocusWithin,
      })}
      onFocus={onFocusInsideWrapper}
      onBlur={onBlurWrapper}
    >
      {children}
    </div>
  );
};

export default ComboboxWrapper;
