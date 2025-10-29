import * as React from "react";

import { cn } from "./utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, style, ...props }, ref) => {
    // Base inline styles that work across all devices
    const baseStyle: React.CSSProperties = {
      color: '#0f172a', // Slate 900 - dark text
      backgroundColor: '#f8fafc', // Slate 50 - light background
      borderColor: '#cbd5e1', // Slate 300 - visible border
      borderWidth: '2px',
      borderStyle: 'solid',
      fontSize: '16px', // Prevents zoom on iOS
      ...style,
    };

    return (
      <input
        type={type}
        data-slot="input"
        style={baseStyle}
        className={cn(
          "flex h-9 w-full min-w-0 rounded-md px-3 py-1 transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "placeholder:text-gray-500",
          "focus-visible:!border-blue-500 focus-visible:ring-blue-500/30 focus-visible:ring-[3px]",
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
