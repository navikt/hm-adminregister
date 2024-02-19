import { useEffect, useState } from "react";
import { create } from "zustand";

type ErrorCode = number;

type Error = {
  errorCode: ErrorCode | undefined;
  errorMessage: string | undefined;
  setGlobalError: (errorCode: ErrorCode, errorMessage?: string) => void;
  clearError: () => void;
};

const useErrorStore = create<Error>((set) => ({
  errorCode: undefined,
  errorMessage: undefined,
  setGlobalError: (errorCode, errorMessage) => set({ errorCode, errorMessage }),
  clearError: () => {
    set({ errorCode: undefined, errorMessage: undefined });
  },
}));

export const useHydratedErrorStore = ((selector, compare) => {
  const store = useErrorStore(selector, compare);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated
    ? store
    : {
        errorCode: undefined,
        errorMessage: undefined,
        setGlobalError: (_errorCode: ErrorCode, _errorMessage?: string) => {},
        clearError: () => {},
      };
}) as typeof useErrorStore;
