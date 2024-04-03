import { create } from "zustand";

type ErrorCode = number;

type Error = {
  errorCode: ErrorCode | undefined;
  errorMessage: string | undefined;
  setGlobalError: (errorCode: ErrorCode, errorMessage?: string) => void;
  clearError: () => void;
};

export const useErrorStore = create<Error>((set) => ({
  errorCode: undefined,
  errorMessage: undefined,
  setGlobalError: (errorCode, errorMessage) => set({ errorCode, errorMessage }),
  clearError: () => {
    set({ errorCode: undefined, errorMessage: undefined });
  },
}));
