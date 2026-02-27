import cl from "clsx";
import { FocusEvent, ReactNode, useRef, useState } from "react";
import { useInputContext } from "./Input/Input.context";

type ComboboxWrapperProps = {
  children: ReactNode;
  className?: string;
  hasError: boolean;
  toggleIsListOpen?: (isListOpen: boolean) => void;
};

const ComboboxWrapper = ({ children, className, hasError, toggleIsListOpen }: ComboboxWrapperProps) => {
  const { toggleOpenButtonRef } = useInputContext();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);

  function onFocusInsideWrapper(e: FocusEvent) {
    if (toggleOpenButtonRef?.current !== e.target) {
      setHasFocusWithin(true);
    }
  }

  function onBlurWrapper(e: FocusEvent) {
    if (!wrapperRef.current?.contains(e.relatedTarget)) {
      toggleIsListOpen && toggleIsListOpen(false);
      setHasFocusWithin(false);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={cl(className, "aksel-form-field", `aksel-form-field--medium`, {
        "aksel-combobox--error": hasError,
        "aksel-combobox--focused": hasFocusWithin,
      })}
      onFocus={onFocusInsideWrapper}
      onBlur={onBlurWrapper}
    >
      {children}
    </div>
  );
};

export default ComboboxWrapper;
