import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { useToastStore } from "../stores/toastStore";

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-md border bg-white p-3 shadow-sm",
            t.type === "success" && "border-emerald-200",
            t.type === "warning" && "border-amber-200",
            t.type === "error" && "border-red-200"
          )}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {t.title ? <div className="text-sm font-semibold">{t.title}</div> : null}
              <div className="text-sm text-slate-700">{t.message}</div>
              {t.action ? (
                <button
                  className="mt-2 text-sm font-medium text-slate-900 underline underline-offset-2"
                  onClick={() => t.action?.onClick()}
                  type="button"
                >
                  {t.action.label}
                </button>
              ) : null}
            </div>
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-slate-100"
              onClick={() => remove(t.id)}
              type="button"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

