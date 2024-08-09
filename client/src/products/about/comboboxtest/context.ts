import { createContext, ReactNode } from "react";

export type FieldsetContextProps = {
  /**
   * Error message applied to element,
   */
  error?: ReactNode;
  /**
   * Overrides internal errorId
   */
  errorId: string;
  /**
   * Changes paddings, margins and font-sizes
   */
  size: "medium" | "small";
  /**
   * Sets fieldset and all form-children to disabled
   */
  disabled: boolean;
  /**
   * Read only-state
   */
  readOnly?: boolean;
};

export const FieldsetContext = createContext<FieldsetContextProps | null>(null);
