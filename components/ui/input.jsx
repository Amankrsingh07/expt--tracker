import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border px-3 py-2 text-sm shadow-sm",

  // 🌞 Light Mode (black text on white background)
  "bg-white text-black border-gray-300 placeholder:text-gray-400",

  // 🌙 Dark Mode (white text on dark background)
  "dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:placeholder:text-gray-400",

        // Focus + Disabled
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",

        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };