import { create } from "zustand";
import type { FieldError } from "../types/errors";

type ErrorState = {
  globalError: string | null;
  fieldErrors: Record<string, string>;
  setGlobalError: (msg: string | null) => void;
  setFieldErrors: (errs: FieldError[]) => void;
  clearError: () => void;
};

export const useErrorStore = create<ErrorState>((set) => ({
  globalError: null,
  fieldErrors: {},
  setGlobalError: (msg) => set({ globalError: msg }),
  setFieldErrors: (errs) => {
    const next: Record<string, string> = {};
    for (const e of errs) next[e.field] = e.message;
    set({ fieldErrors: next });
  },
  clearError: () => set({ globalError: null, fieldErrors: {} })
}));

