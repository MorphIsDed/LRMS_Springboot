import { AlertTriangle, Inbox } from "lucide-react";
import { Button } from "./ui/Button";

export function EmptyState({
  variant,
  message,
  actionLabel,
  onAction
}: {
  variant: "empty" | "error";
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const Icon = variant === "error" ? AlertTriangle : Inbox;
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border bg-white p-8 text-center">
      <Icon className={variant === "error" ? "h-6 w-6 text-red-600" : "h-6 w-6 text-slate-700"} />
      <div className="text-sm text-slate-700">{message}</div>
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction} type="button">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

