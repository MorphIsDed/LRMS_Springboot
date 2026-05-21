import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, variant = "default", ...props }: HTMLAttributes<HTMLDivElement> & { variant?: "default" | "glass" }) {
  const baseClasses = "rounded-2xl border border-white/5 p-6";
  const variantClasses = variant === "glass"
    ? "bg-card/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
    : "bg-white shadow-sm";
  return <div className={cn(baseClasses, variantClasses, className)} {...props} />;
}
