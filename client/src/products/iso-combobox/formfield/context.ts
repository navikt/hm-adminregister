import { createContext } from "react";

export type FieldsetContextProps = {
  /**
   * Error message applied to element,
   */
  error?: React.ReactNode;
  /**
   * Overrides internal errorId
   */
  errorId: string;
  /**
   * Read only-state
   */
  readOnly?: boolean;
};

export const FieldsetContext = createContext<FieldsetContextProps | null>(null);