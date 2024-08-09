import cl from "clsx";
import { useRef, useState } from "react";

type ComboboxWrapperProps = {
  children: any;
  className?: string;
  hasError: boolean;
  inputProps: {
    disabled?: boolean;
  };
  inputSize: string;
};

const ComboboxWrapper = ({ children, className, hasError, inputProps, inputSize }: ComboboxWrapperProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);

  function onFocusInsideWrapper(e) {
    if (!wrapperRef.current?.contains(e.relatedTarget)) {
      setHasFocusWithin(true);
    }
  }

  function onBlurWrapper(e) {
    if (!wrapperRef.current?.contains(e.relatedTarget)) {
      setHasFocusWithin(false);
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={cl(className, "navds-form-field", `navds-form-field--${inputSize}`, {
        "navds-combobox--error": hasError,
        "navds-combobox--disabled": !!inputProps.disabled,
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
