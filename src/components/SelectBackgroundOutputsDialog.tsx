import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Mail, Printer, Image as ImageIcon, Move, Plus, Minus } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export type BackgroundOutput = {
  [key: string]: {
    print: number; // quantity of prints for this background
    email: boolean;
  };
};

interface SelectBackgroundOutputsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBackgrounds: (number | string)[];
  backgroundOutputs: BackgroundOutput;
  onConfirm: (outputs: BackgroundOutput) => void;
  numberOfPrints: number;
  backgroundNames?: { [key: string]: string }; // Map of background IDs to their names
  backgroundImages?: { [key: string]: string }; // Map of background IDs to their image URLs
}

// Helper function to get background display name
const getBackgroundName = (id: number | string, backgroundNames?: { [key: string]: string }): string => {
  const key = String(id);
  
  // First, try to get the name from the backgroundNames map
  if (backgroundNames && backgroundNames[key]) {
    return backgroundNames[key];
  }
  
  // Fallback to generic names
  if (typeof id === "number") {
    return `Background ${id}`;
  }
  
  const idStr = String(id);
  if (idStr.startsWith("custom-")) {
    const num = idStr.replace("custom-", "");
    return `Extra Background ${num}`;
  }
  if (idStr.startsWith("uploaded-custom-")) {
    const num = idStr.replace("uploaded-custom-", "");
    return `Custom Upload ${num}`;
  }
  
  return `Background ${idStr}`;
};

export function SelectBackgroundOutputsDialog({
  open,
  onOpenChange,
  selectedBackgrounds,
  backgroundOutputs,
  onConfirm,
  numberOfPrints,
  backgroundNames,
  backgroundImages,
}: SelectBackgroundOutputsDialogProps) {
  const [localOutputs, setLocalOutputs] = useState<BackgroundOutput>(backgroundOutputs);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);

  // Count total prints across all backgrounds
  const printCount = Object.values(localOutputs).reduce((total, output) => total + (output?.print || 0), 0);

  // Update local state when backgroundOutputs prop changes
  useEffect(() => {
    setLocalOutputs(backgroundOutputs);
  }, [backgroundOutputs]);

  // Reset position when dialog opens
  useEffect(() => {
    if (open) {
      setPosition({ x: 0, y: 0 });
    }
  }, [open]);

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({
      x: clientX - position.x,
      y: clientY - position.y,
    });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;

    // Get viewport boundaries
    const maxX = window.innerWidth - (dialogRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (dialogRef.current?.offsetHeight || 0);

    // Constrain to viewport
    const constrainedX = Math.max(-maxX / 2, Math.min(maxX / 2, newX));
    const constrainedY = Math.max(-maxY / 2, Math.min(maxY / 2, newY));

    setPosition({ x: constrainedX, y: constrainedY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleDragStart(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const handlePrintQuantityChange = (bgId: number | string, delta: number) => {
    setLocalOutputs((prev) => {
      const key = String(bgId);
      const currentQuantity = prev[key]?.print || 0;
      const newQuantity = Math.max(0, currentQuantity + delta);
      
      // Calculate total prints if we make this change
      const totalPrints = Object.entries(prev).reduce((total, [k, output]) => {
        if (k === key) {
          return total + newQuantity;
        }
        return total + (output?.print || 0);
      }, 0);
      
      // Don't allow if it would exceed the limit
      if (totalPrints > numberOfPrints) {
        return prev;
      }
      
      return {
        ...prev,
        [key]: {
          ...prev[key],
          print: newQuantity,
        },
      };
    });
  };

  const handleEmailToggle = (bgId: number | string) => {
    setLocalOutputs((prev) => ({
      ...prev,
      [String(bgId)]: {
        ...prev[String(bgId)],
        email: !prev[String(bgId)]?.email,
      },
    }));
  };

  const handleDistributePrintsEvenly = () => {
    const newOutputs = { ...localOutputs };
    const backgroundCount = selectedBackgrounds.length;
    const printsPerBackground = Math.floor(numberOfPrints / backgroundCount);
    const remainder = numberOfPrints % backgroundCount;
    
    selectedBackgrounds.forEach((bgId, index) => {
      const key = String(bgId);
      if (!newOutputs[key]) {
        newOutputs[key] = { print: 0, email: false };
      }
      // Distribute evenly, adding 1 extra to first backgrounds for remainder
      newOutputs[key].print = printsPerBackground + (index < remainder ? 1 : 0);
    });
    
    setLocalOutputs(newOutputs);
  };

  const handleSelectAllEmails = () => {
    const newOutputs = { ...localOutputs };
    selectedBackgrounds.forEach((bgId) => {
      const key = String(bgId);
      if (!newOutputs[key]) {
        newOutputs[key] = { print: 0, email: false };
      }
      newOutputs[key].email = true;
    });
    setLocalOutputs(newOutputs);
  };

  const handleDeselectAllPrints = () => {
    const newOutputs = { ...localOutputs };
    selectedBackgrounds.forEach((bgId) => {
      const key = String(bgId);
      if (!newOutputs[key]) {
        newOutputs[key] = { print: 0, email: false };
      }
      newOutputs[key].print = 0;
    });
    setLocalOutputs(newOutputs);
  };

  const handleDeselectAllEmails = () => {
    const newOutputs = { ...localOutputs };
    selectedBackgrounds.forEach((bgId) => {
      const key = String(bgId);
      if (!newOutputs[key]) {
        newOutputs[key] = { print: 0, email: false };
      }
      newOutputs[key].email = false;
    });
    setLocalOutputs(newOutputs);
  };

  const handleConfirm = () => {
    onConfirm(localOutputs);
    onOpenChange(false);
  };

  const isValid = () => {
    // Check if at least one output method is selected for each background
    const allBackgroundsHaveOutput = selectedBackgrounds.every((bgId) => {
      const key = String(bgId);
      const output = localOutputs[key];
      return output && (output.print > 0 || output.email);
    });
    
    // Check if total prints equals the selected number (all prints must be assigned)
    const totalPrints = Object.values(localOutputs).reduce((total, output) => total + (output?.print || 0), 0);
    
    return allBackgroundsHaveOutput && totalPrints === numberOfPrints;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        ref={dialogRef}
        className="max-w-[95vw] w-[950px] max-h-[90vh] bg-white flex flex-col"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? "none" : "transform 0.2s ease-out",
        }}
      >
        <DialogHeader 
          className="cursor-move select-none relative flex-shrink-0"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="absolute top-2 right-2 text-slate-400">
            <Move className="w-5 h-5" />
          </div>
          <DialogTitle className="text-3xl text-center mb-2 pr-8">
            Select Background Outputs
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            <span className="mt-2 inline-flex items-center gap-2 bg-blue-50 border border-blue-300 rounded-lg px-3 py-1.5">
              <Printer className="w-4 h-4 text-blue-600" />
              <span className="text-sm">
                Prints Assigned: <span className={printCount !== numberOfPrints ? "text-orange-600 font-semibold" : "text-green-600 font-semibold"}>{printCount}</span> / {numberOfPrints}
              </span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 min-h-0" style={{ maxHeight: 'calc(90vh - 280px)' }}>
          {/* Quick action buttons */}
          <div className="grid grid-cols-2 gap-3 pb-4 border-b">
            <Button
              onClick={handleDistributePrintsEvenly}
              variant="outline"
              size="sm"
              disabled={numberOfPrints === 0}
              className="h-12 px-5 gap-2 border-2 hover:bg-blue-50 hover:border-blue-400 active:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <div className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                <Printer className="w-4 h-4 text-white" />
              </div>
              Select All Prints
            </Button>
            <Button
              onClick={handleDeselectAllPrints}
              variant="outline"
              size="sm"
              className="h-12 px-5 gap-2 border-2 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 whitespace-nowrap"
            >
              <div className="w-7 h-7 bg-slate-500 rounded flex items-center justify-center flex-shrink-0">
                <Printer className="w-4 h-4 text-white" />
              </div>
              Deselect All Prints
            </Button>
            <Button
              onClick={handleSelectAllEmails}
              variant="outline"
              size="sm"
              className="h-12 px-5 gap-2 border-2 hover:bg-green-50 hover:border-green-400 active:bg-green-100 whitespace-nowrap"
            >
              <div className="w-7 h-7 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              Select All Emails
            </Button>
            <Button
              onClick={handleDeselectAllEmails}
              variant="outline"
              size="sm"
              className="h-12 px-5 gap-2 border-2 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 whitespace-nowrap"
            >
              <div className="w-7 h-7 bg-slate-500 rounded flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              Deselect All Emails
            </Button>
          </div>

          {/* Background list */}
          {selectedBackgrounds.map((bgId) => {
            const key = String(bgId);
            const output = localOutputs[key] || { print: 0, email: false };
            const bgName = getBackgroundName(bgId, backgroundNames);
            const bgImageUrl = backgroundImages?.[key];
            
            const canIncreasePrints = printCount < numberOfPrints;
            const canDecreasePrints = output.print > 0;

            // Determine background type for styling
            const idStr = String(bgId);
            let bgGradient = "from-blue-400 to-blue-600"; // Default for standard backgrounds
            let borderColor = "border-blue-200";
            
            if (idStr.startsWith("custom-")) {
              bgGradient = "from-purple-400 to-purple-600";
              borderColor = "border-purple-200";
            } else if (idStr.startsWith("uploaded-custom-")) {
              bgGradient = "from-orange-400 to-orange-600";
              borderColor = "border-orange-200";
            }

            return (
              <Card key={key} className={`p-4 shadow-sm border-2 ${borderColor} overflow-hidden`}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className={`relative w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border-2 ${borderColor}`}>
                      {bgImageUrl ? (
                        <ImageWithFallback
                          src={bgImageUrl}
                          alt={bgName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${bgGradient} flex items-center justify-center`}>
                          <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                      )}
                      {/* Visual indicators for selected outputs */}
                      <div className="absolute -top-1 -right-1 flex gap-0.5">
                        {output.print > 0 && (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <span className="text-white text-[10px] font-bold">{output.print}</span>
                          </div>
                        )}
                        {output.email && (
                          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <Mail className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg truncate">{bgName}</p>
                    <p className="text-sm text-slate-500">
                      {output.print === 0 && !output.email && (
                        <span className="text-red-500">
                          Please select at least one output
                        </span>
                      )}
                      {output.print > 0 && output.email && `${output.print} Print${output.print > 1 ? 's' : ''} & Email`}
                      {output.print > 0 && !output.email && `${output.print} Print${output.print > 1 ? 's' : ''} only`}
                      {output.print === 0 && output.email && "Email only"}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0 items-center">
                    {/* Print quantity controls */}
                    <div className="flex items-center gap-1">
                      <Printer className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      <div className="flex items-center gap-0.5 border-2 border-slate-300 rounded-md bg-white">
                        <Button
                          onClick={() => handlePrintQuantityChange(bgId, -1)}
                          disabled={!canDecreasePrints}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-6 p-0 hover:bg-slate-100 disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <div className="w-8 text-center font-semibold">
                          {output.print}
                        </div>
                        <Button
                          onClick={() => handlePrintQuantityChange(bgId, 1)}
                          disabled={!canIncreasePrints}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-6 p-0 hover:bg-blue-100 disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Email checkbox */}
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Checkbox
                        id={`${key}-email`}
                        checked={output.email}
                        onCheckedChange={() => handleEmailToggle(bgId)}
                        className="w-5 h-5"
                      />
                      <Label
                        htmlFor={`${key}-email`}
                        className="cursor-pointer flex items-center gap-1 select-none"
                      >
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <DialogFooter className="flex gap-4 justify-center pt-4 border-t mt-4 flex-shrink-0">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            size="lg"
            className="h-14 w-[200px] text-lg border-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            size="lg"
            disabled={!isValid()}
            className="h-14 w-[200px] text-lg bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
