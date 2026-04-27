import React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? "span" : "button";

    const variants = {
      default:
        "bg-blue-600 text-white hover:bg-blue-700",
      outline:
        "border border-gray-300 bg-transparent hover:bg-surface",
      ghost:
        "hover:bg-surface",
      destructive:
        "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 px-3 text-sm",
      lg: "h-12 px-6 text-lg",
    };

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          "focus:ring-[color:var(--foreground)]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };