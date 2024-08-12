import { forwardRef } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import { useFilteredOptionsContext } from "../FilteredOptions/filteredOptionsContext";

interface ToggleListButtonProps {
  toggleListButtonLabel?: string;
}

export const ToggleListButton = forwardRef<HTMLButtonElement, ToggleListButtonProps>(function ToggleListButton(
  { toggleListButtonLabel },
  ref,
) {
  const { isListOpen, toggleIsListOpen } = useFilteredOptionsContext();
  return (
    <button
      type="button"
      onPointerUp={() => toggleIsListOpen()}
      onKeyDown={({ key }) => key === "Enter" && toggleIsListOpen()}
      className="navds-combobox__button-toggle-list"
      aria-expanded={isListOpen}
      tabIndex={-1}
      ref={ref}
    >
      <span className="navds-sr-only">Alternativer</span>
      {isListOpen ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
    </button>
  );
});

export default ToggleListButton;
