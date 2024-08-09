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
   * Read only-state
   */
  readOnly?: boolean;
};

export const FieldsetContext = createContext<FieldsetContextProps | null>(null);
