import { useCallback } from "react";
import type { AppError, FieldErrorBundle } from "../types/errors";
import { useToastStore } from "../stores/toastStore";
import { useErrorStore } from "../stores/errorStore";

export function useErrorHandler() {
  const toast = useToastStore();
  const setGlobalError = useErrorStore((s) => s.setGlobalError);
  const setFieldErrors = useErrorStore((s) => s.setFieldErrors);

  return useCallback(
    (err: unknown) => {
      const e = err as AppError;

      if (e && typeof e === "object" && (e as FieldErrorBundle).type === "FIELD_ERROR") {
        setFieldErrors((e as FieldErrorBundle).fieldErrors);
        toast.push({ type: "error", message: "Please fix the highlighted fields." });
        return;
      }

      const msg = e && typeof e === "object" && "message" in e ? String((e as any).message) : "Error.";
      setGlobalError(msg);
      toast.push({ type: "error", message: msg });
      // eslint-disable-next-line no-console
      console.error("[ui:error]", err);
    },
    [setFieldErrors, setGlobalError, toast]
  );
}

