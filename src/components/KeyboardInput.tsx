import { useRef } from "react";
import { Input } from "./ui/input";
import { VirtualKeyboard } from "./VirtualKeyboard";

interface KeyboardInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onCloseKeyboard?: () => void;
  isKeyboardVisible?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
  placeholder?: string;
  type?: string;
  className?: string;
  id?: string;
  fieldLabel?: string;
}

export function KeyboardInput({
  value,
  onChange,
  onFocus,
  onCloseKeyboard,
  isKeyboardVisible = false,
  onBlur,
  onEnter,
  placeholder,
  type = "text",
  className,
  id,
  fieldLabel,
}: KeyboardInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (key: string) => {
    onChange(value + key);
    // Keep input focused after virtual keyboard interaction
    inputRef.current?.focus();
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
    inputRef.current?.focus();
  };

  const handleClose = () => {
    onCloseKeyboard?.();
    // Also trigger blur if provided
    if (onBlur && inputRef.current) {
      const event = new FocusEvent("blur", { bubbles: true });
      Object.defineProperty(event, "target", {
        writable: false,
        value: inputRef.current,
      });
      onBlur(event as unknown as React.FocusEvent<HTMLInputElement>);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter?.();
      onCloseKeyboard?.();
    }
  };

  return (
    <>
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => onFocus?.()}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type={type}
        className={className}
      />

      {isKeyboardVisible && (
        <VirtualKeyboard
          value={value}
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onClose={handleClose}
          onEnter={onEnter}
          fieldLabel={fieldLabel}
          placeholder={placeholder}
        />
      )}
    </>
  );
}