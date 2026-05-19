import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-white/5 bg-card/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6", className)} {...props} />;
}

