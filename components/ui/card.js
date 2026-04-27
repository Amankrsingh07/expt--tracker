import React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border shadow-sm",
      "bg-surface text-[var(--foreground)] border-gray-200",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
);

const CardTitle = ({ className, ...props }) => (
  <h3
    className={cn("text-xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
);

const CardDescription = ({ className, ...props }) => (
  <p
    className={cn("text-sm text-gray-500 dark:text-gray-400", className)}
    {...props}
  />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
);

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};