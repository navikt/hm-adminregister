import cl from "clsx";
import { ReactNode, useRef, useState } from "react";

type ComboboxWrapperProps = {
  children: ReactNode;
  className?: string;
  hasError: boolean;
};

const ComboboxWrapper = ({ children, className, hasError }: ComboboxWrapperProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);

  function onFocusInsideWrapper(e: { relatedTarget: Node | null }) {
    if (!wrapperRef.current?.contains(e.relatedTarget)) {
      setHasFocusWithin(true);
    }
  }

  function onBlurWrapper(e: { relatedTarget: Node | null }) {
    if (!wrapperRef.current?.contains(e.relatedTarget)) {
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
