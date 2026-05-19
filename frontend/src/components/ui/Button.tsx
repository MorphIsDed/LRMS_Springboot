import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        size === "lg" && "h-12 px-8 text-base",
        size === "md" && "h-11 px-6",
        size === "sm" && "h-9 px-4",
        variant === "primary" && "bg-primary text-white shadow hover:bg-primary/90 shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5",
        variant === "secondary" && "bg-muted text-foreground hover:bg-muted/80",
        variant === "destructive" && "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
        variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    />
  );
}

