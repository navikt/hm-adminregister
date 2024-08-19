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
      className={cl(className, "navds-form-field", `navds-form-field--medium`, {
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
