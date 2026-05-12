import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean };

export function Input({ className, hasError, ...props }: Props) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border bg-white px-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400",
        hasError && "border-red-400 focus:border-red-500",
        className
      )}
      {...props}
    />
  );
}

