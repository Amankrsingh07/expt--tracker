import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border px-3 py-2 text-sm shadow-sm",
        "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "border-gray-300 bg-surface text-[var(--foreground)]",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };