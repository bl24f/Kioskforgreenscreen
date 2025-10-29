import { useState, useRef, useEffect } from "react";
import { Input } from "./ui/input";
import { VirtualKeyboard } from "./VirtualKeyboard";

interface KeyboardInputProps {
  value: string;
  onChange: (value: string) => void;
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
  onBlur,
  onEnter,
  placeholder,
  type = "text",
  className,
  id,
  fieldLabel,
}: KeyboardInputProps) {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (key: string) => {
    onChange(value + key);
    // Keep input focused after virtual keyboard interaction
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
    // Keep input focused after virtual keyboard interaction
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClose = () => {
    setShowKeyboard(false);
    // Trigger onBlur if provided
    if (onBlur && inputRef.current) {
      const event = new FocusEvent("blur", { bubbles: true });
      Object.defineProperty(event, "target", {
        writable: false,
        value: inputRef.current,
      });
      onBlur(event as unknown as React.FocusEvent<HTMLInputElement>);
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Show keyboard but don't prevent focus - allow normal typing
    setShowKeyboard(true);
  };

  const handleInputClick = () => {
    setShowKeyboard(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onEnter) {
        onEnter();
      }
      // Close the keyboard when Enter is pressed
      setShowKeyboard(false);
    }
  };

  return (
    <>
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={handleInputFocus}
        onClick={handleInputClick}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        type={type}
        className={className}
      />
      {showKeyboard && (
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