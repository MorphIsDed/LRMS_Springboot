import { create } from "zustand";
import { nanoid } from "nanoid/non-secure";

export type ToastType = "success" | "error" | "warning";

export type ToastAction = { label: string; onClick: () => void };

export type Toast = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  action?: ToastAction;
  createdAt: number;
};

type ToastState = {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id" | "createdAt">) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 5000;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = nanoid();
    const createdAt = Date.now();
    set((s) => {
      const next = [{ ...toast, id, createdAt }, ...s.toasts].slice(0, MAX_TOASTS);
      return { toasts: next };
    });
    window.setTimeout(() => {
      const exists = get().toasts.some((t) => t.id === id);
      if (exists) get().remove(id);
    }, AUTO_DISMISS_MS);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] })
}));

