import { createContext } from "react";

export type FieldsetContextProps = {
  /**
   * Error message applied to element,
   */
  error?: React.ReactNode;
  /**
   * Read only-state
   */
  readOnly?: boolean;
};

export const FieldsetContext = createContext<FieldsetContextProps | null>(null);
