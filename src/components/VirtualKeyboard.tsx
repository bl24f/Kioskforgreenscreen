import { Button } from "./ui/button";
import { Delete, X, Space, CornerDownLeft } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClose: () => void;
  onEnter?: () => void;
  value: string;
  fieldLabel?: string;
  placeholder?: string;
}

export function VirtualKeyboard({
  onKeyPress,
  onBackspace,
  onClose,
  onEnter,
  value,
  fieldLabel,
  placeholder,
}: VirtualKeyboardProps) {
  const [isShift, setIsShift] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const keys = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  const specialKeys = ["@", ".", "-", "_", ".com"];

  const handleKeyPress = (key: string) => {
    const shouldCapitalize = isShift || capsLock;
    const finalKey = shouldCapitalize ? key.toUpperCase() : key;
    onKeyPress(finalKey);
    
    // Reset shift after one key press (but not caps lock)
    if (isShift && !capsLock) {
      setIsShift(false);
    }
  };

  const handleShift = () => {
    setIsShift(!isShift);
  };

  const handleCapsLock = () => {
    setCapsLock(!capsLock);
    setIsShift(false);
  };

  const isUppercase = isShift || capsLock;

  const keyboardContent = (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/30 animate-in fade-in-0 duration-200 pointer-events-none">
      <div className="w-full max-w-3xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-t-3xl shadow-2xl p-4 animate-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white active:scale-95 transition-all select-none"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Keyboard */}
        <div className="space-y-1.5">
          {/* Number Row */}
          <div className="flex gap-1.5 justify-center">
            {keys[0].map((key) => (
              <Button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="h-11 w-11 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-lg active:scale-95 transition-all select-none rounded-lg shadow-lg"
              >
                {key}
              </Button>
            ))}
            <Button
              onClick={onBackspace}
              className="h-11 w-16 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white active:scale-95 transition-all select-none rounded-lg shadow-lg"
            >
              <Delete className="h-4 w-4" />
            </Button>
          </div>

          {/* First Letter Row */}
          <div className="flex gap-1.5 justify-center">
            {keys[1].map((key) => (
              <Button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="h-11 w-11 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-lg active:scale-95 transition-all select-none rounded-lg shadow-lg"
              >
                {isUppercase ? key.toUpperCase() : key}
              </Button>
            ))}
          </div>

          {/* Second Letter Row */}
          <div className="flex gap-1.5 justify-center">
            <Button
              onClick={handleCapsLock}
              className={`h-11 w-16 ${
                capsLock
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-slate-700 hover:bg-slate-600"
              } active:bg-slate-500 text-white text-xs active:scale-95 transition-all select-none rounded-lg shadow-lg`}
            >
              CAPS
            </Button>
            {keys[2].map((key) => (
              <Button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="h-11 w-11 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-lg active:scale-95 transition-all select-none rounded-lg shadow-lg"
              >
                {isUppercase ? key.toUpperCase() : key}
              </Button>
            ))}
          </div>

          {/* Third Letter Row */}
          <div className="flex gap-1.5 justify-center">
            <Button
              onClick={handleShift}
              className={`h-11 w-16 ${
                isShift && !capsLock
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-slate-700 hover:bg-slate-600"
              } active:bg-slate-500 text-white text-xs active:scale-95 transition-all select-none rounded-lg shadow-lg`}
            >
              SHIFT
            </Button>
            {keys[3].map((key) => (
              <Button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="h-11 w-11 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white text-lg active:scale-95 transition-all select-none rounded-lg shadow-lg"
              >
                {isUppercase ? key.toUpperCase() : key}
              </Button>
            ))}
          </div>

          {/* Bottom Row - Special Keys and Space */}
          <div className="flex gap-1.5 justify-center">
            {specialKeys.map((key) => (
              <Button
                key={key}
                onClick={() => onKeyPress(key)}
                className="h-11 px-3 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white active:scale-95 transition-all select-none rounded-lg shadow-lg"
              >
                {key}
              </Button>
            ))}
            <Button
              onClick={() => onKeyPress(" ")}
              className="h-11 flex-1 max-w-xs bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-white active:scale-95 transition-all select-none rounded-lg shadow-lg"
            >
              <Space className="h-4 w-4 mr-1" />
              Space
            </Button>
            <Button
              onClick={() => {
                if (onEnter) {
                  onEnter();
                } else {
                  onClose();
                }
              }}
              className="h-11 w-24 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white active:scale-95 transition-all select-none rounded-lg shadow-lg"
            >
              <CornerDownLeft className="h-4 w-4 mr-1" />
              Enter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(keyboardContent, document.body);
}