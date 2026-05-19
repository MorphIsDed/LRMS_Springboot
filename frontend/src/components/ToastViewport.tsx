import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "../lib/cn";
import { useToastStore } from "../stores/toastStore";

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-xl border bg-card/90 backdrop-blur-md p-4 shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 flex gap-3",
            t.type === "success" && "border-emerald-500/30 shadow-emerald-500/10",
            t.type === "warning" && "border-amber-500/30 shadow-amber-500/10",
            t.type === "error" && "border-destructive/30 shadow-destructive/10"
          )}
          role="status"
        >
          <div className="flex-shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
            {t.type === 'error' && <Info className="w-5 h-5 text-destructive" />}
          </div>
          <div className="flex-1 min-w-0">
            {t.title ? <div className="text-sm font-semibold text-foreground">{t.title}</div> : null}
            <div className="text-sm text-mutedForeground mt-0.5">{t.message}</div>
            {t.action ? (
              <button
                className="mt-2 text-sm font-medium text-primary hover:underline underline-offset-2"
                onClick={() => t.action?.onClick()}
                type="button"
              >
                {t.action.label}
              </button>
            ) : null}
          </div>
          <button
            className="flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted text-mutedForeground hover:text-foreground transition-colors"
            onClick={() => remove(t.id)}
            type="button"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

