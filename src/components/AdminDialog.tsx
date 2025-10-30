import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Settings, Save, DollarSign, Palette, CreditCard, Truck, Image, Plus, Minus, History, Camera } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { KeyboardInput } from "./KeyboardInput";
import { OrderHistoryTab } from "./OrderHistoryTab";
import { UploadFinalPhotoTab } from "./UploadFinalPhotoTab";
import { getCurrentOrderCounter, resetOrderCounter } from "./OrderNumberManager";

interface AdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  basePrice: string;
  setBasePrice: (value: string) => void;
  theme: string;
  setTheme: (value: string) => void;
  availablePaymentMethods: string[];
  setAvailablePaymentMethods: (value: string[]) => void;
  availableDeliveryMethods: string[];
  setAvailableDeliveryMethods: (value: string[]) => void;
  maxNumberOfPhotos: number;
  setMaxNumberOfPhotos: (value: number) => void;
  maxNumberOfEmails: number;
  setMaxNumberOfEmails: (value: number) => void;
  maxNumberOfPrints: number;
  setMaxNumberOfPrints: (value: number) => void;
  maxDigitalBackgrounds: number;
  setMaxDigitalBackgrounds: (value: number) => void;
  enabledBackgrounds: number[];
  setEnabledBackgrounds: (value: number[]) => void;
  enableCustomBackgrounds: boolean;
  setEnableCustomBackgrounds: (value: boolean) => void;
  isFreeDay: boolean;
  setIsFreeDay: (value: boolean) => void;
  showFreeDayOption: boolean;
  setShowFreeDayOption: (value: boolean) => void;
}

const ALL_PAYMENT_METHODS = [
  { id: "cash", label: "Cash" },
  { id: "debit", label: "Debit Card" },
  { id: "credit", label: "Credit Card" },
  { id: "check", label: "Check" },
];

const ALL_DELIVERY_METHODS = [
  { id: "email", label: "Email Delivery" },
  { id: "prints", label: "Physical Prints" },
];

const ALL_BACKGROUNDS = [
  { id: 1, name: "Tropical Beach" },
  { id: 2, name: "Eiffel Tower" },
  { id: 3, name: "New York City" },
  { id: 4, name: "Mountain Sunset" },
  { id: 5, name: "Space Galaxy" },
  { id: 6, name: "Cherry Blossoms" },
  { id: 7, name: "Northern Lights" },
  { id: 8, name: "Desert Dunes" },
  { id: 9, name: "Underwater Ocean" },
  { id: 10, name: "Autumn Forest" },
  { id: 11, name: "Grand Canyon" },
  { id: 12, name: "London Bridge" },
];

function useHoldIncrement(
  min: number,
  max: number,
  step: number = 1
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const setValueRef = useRef<((value: number) => void) | null>(null);
  const directionRef = useRef<"up" | "down" | null>(null);
  const currentValueRef = useRef<number>(0);

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const start = (currentValue: number, setValue: (value: number) => void, direction: "up" | "down") => {
    stop(); // clear any existing interval/timeout first

    // Store refs for use in timeout/interval
    currentValueRef.current = currentValue;
    setValueRef.current = setValue;
    directionRef.current = direction;

    // Immediate single increment/decrement
    const newValue = direction === "up"
      ? Math.min(max, currentValue + step)
      : Math.max(min, currentValue - step);
    currentValueRef.current = newValue;
    setValue(newValue);

    // Wait 1 second before starting rapid increment
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (setValueRef.current && directionRef.current) {
          const nextValue = directionRef.current === "up"
            ? Math.min(max, currentValueRef.current + step)
            : Math.max(min, currentValueRef.current - step);
          currentValueRef.current = nextValue;
          setValueRef.current(nextValue);
        }
      }, 150);
    }, 1000);
  };

  return { start, stop };
}


export function AdminDialog({
  open,
  onOpenChange,
  basePrice,
  setBasePrice,
  theme,
  setTheme,
  availablePaymentMethods,
  setAvailablePaymentMethods,
  availableDeliveryMethods,
  setAvailableDeliveryMethods,
  maxNumberOfPhotos,
  setMaxNumberOfPhotos,
  maxNumberOfEmails,
  setMaxNumberOfEmails,
  maxNumberOfPrints,
  setMaxNumberOfPrints,
  maxDigitalBackgrounds,
  setMaxDigitalBackgrounds,
  enabledBackgrounds,
  setEnabledBackgrounds,
  enableCustomBackgrounds,
  setEnableCustomBackgrounds,
  isFreeDay,
  setIsFreeDay,
  showFreeDayOption,
  setShowFreeDayOption,
}: AdminDialogProps) {
  const [basePriceError, setBasePriceError] = useState<string>("");
  const [currentOrderCount, setCurrentOrderCount] = useState<number>(0);

  // Load current order counter when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentOrderCount(getCurrentOrderCounter());
    }
  }, [open]);

  
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = () => {
    handleClose();
  };

  const validateBasePrice = (value: string) => {
    // Allow empty string
    if (value === "") {
      setBasePriceError("");
      return true;
    }

    // Check if it's a valid number
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      setBasePriceError("Invalid - must be a valid number");
      return false;
    }

    setBasePriceError("");
    return true;
  };

  const handleBasePriceChange = (value: string) => {
    setBasePrice(value);
    validateBasePrice(value);
  };

  const togglePaymentMethod = (methodId: string) => {
    if (availablePaymentMethods.includes(methodId)) {
      // Don't allow removing the last payment method
      if (availablePaymentMethods.length > 1) {
        setAvailablePaymentMethods(availablePaymentMethods.filter(m => m !== methodId));
      }
    } else {
      setAvailablePaymentMethods([...availablePaymentMethods, methodId]);
    }
  };

  const toggleDeliveryMethod = (methodId: string) => {
    if (availableDeliveryMethods.includes(methodId)) {
      // Don't allow removing the last delivery method
      if (availableDeliveryMethods.length > 1) {
        setAvailableDeliveryMethods(availableDeliveryMethods.filter(m => m !== methodId));
      }
    } else {
      setAvailableDeliveryMethods([...availableDeliveryMethods, methodId]);
    }
  };

  const toggleBackground = (bgId: number) => {
    if (enabledBackgrounds.includes(bgId)) {
      // Don't allow removing the last background
      if (enabledBackgrounds.length > 1) {
        setEnabledBackgrounds(enabledBackgrounds.filter(id => id !== bgId));
      }
    } else {
      setEnabledBackgrounds([...enabledBackgrounds, bgId].sort((a, b) => a - b));
    }
  };

  const toggleAllBackgrounds = () => {
    if (enabledBackgrounds.length === ALL_BACKGROUNDS.length) {
      // Deselect all except first
      setEnabledBackgrounds([1]);
    } else {
      // Select all
      setEnabledBackgrounds(ALL_BACKGROUNDS.map(bg => bg.id));
    }
  };

  // Create one hook instance per field - both buttons use the SAME hook
  const emailHold = useHoldIncrement(1, 50);
  const printHold = useHoldIncrement(1, 50);
  const bgHold = useHoldIncrement(1, 50);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-2xl max-h-[90vh] bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Settings className="w-5 h-5" />
            Admin Settings
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Configure kiosk settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid grid-flow-col auto-cols-max bg-slate-800 border-slate-700">
              <TabsTrigger value="general" className="text-xs sm:text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="text-xs sm:text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">
                <CreditCard className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Payment</span>
              </TabsTrigger>
              <TabsTrigger value="delivery" className="text-xs sm:text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">
                <Truck className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Delivery</span>
              </TabsTrigger>
              <TabsTrigger value="backgrounds" className="text-xs sm:text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">
                <Image className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Backgrounds</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs sm:text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">
                <Camera className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs sm:text-sm data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">
                <History className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              <TabsContent value="general" className="space-y-4 pr-4">
                <div className="space-y-2">
                  <Label htmlFor="adminBasePrice" className="text-slate-200">Base Price ($)</Label>
                  <KeyboardInput
                    id="adminBasePrice"
                    type="text"
                    value={basePrice}
                    onChange={handleBasePriceChange}
                    placeholder="e.g., 10.00"
                    className={`h-12 text-lg bg-slate-800 text-white border-slate-600 placeholder:text-slate-400 ${basePriceError ? "border-red-500 border-2" : ""}`}
                    fieldLabel="Base Price"
                  />
                  {basePriceError ? (
                    <p className="text-xs text-red-400 font-semibold">{basePriceError}</p>
                  ) : (
                    <p className="text-xs text-slate-400">Base price for photo session</p>
                  )}
                </div>
                <div className="space-y-3 pt-2 border-t border-slate-700">
                  <Label className="text-slate-200">Special Pricing</Label>
                  <div className="flex items-center space-x-3 p-3 border border-slate-700 rounded-lg hover:bg-slate-800">
                    <Checkbox
                      id="show-free-day"
                      checked={showFreeDayOption}
                      onCheckedChange={(checked) => {
                        setShowFreeDayOption(checked as boolean);
                        // When enabling Free Day Option, automatically activate Free Day
                        if (checked) {
                          setIsFreeDay(true);
                        } else {
                          // When disabling, also deactivate Free Day
                          setIsFreeDay(false);
                        }
                      }}
                      className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor="show-free-day"
                      className="flex-1 cursor-pointer text-base text-slate-200"
                    >
                      <div>
                        Enable "Free Day" (All Photos Free)
                        <p className="text-xs text-slate-400 mt-1">
                          Make all photos free - sets total price to $0.00
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminTheme" className="text-slate-200">Today's Special Theme</Label>
                  <KeyboardInput
                    id="adminTheme"
                    value={theme}
                    onChange={(value) => setTheme(value)}
                    placeholder="e.g., Beach Party, Holiday Magic"
                    className="h-12 text-lg bg-slate-800 text-white border-slate-600 placeholder:text-slate-400"
                    fieldLabel="Today's Special Theme"
                  />
                  <p className="text-xs text-slate-400">Optional theme displayed on home screen</p>
                </div>
                
                <div className="space-y-2 pt-4 border-t border-slate-700">
                  <Label className="text-slate-200">Order Counter</Label>
                  <div className="flex items-center space-x-3 p-3 border border-slate-700 rounded-lg bg-slate-800">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-slate-300">Current Count:</span>
                        <span className="text-xl font-semibold text-blue-400">{currentOrderCount}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Next order will be #{String(currentOrderCount + 1).padStart(4, '0')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to reset the order counter to 0? This action cannot be undone.')) {
                          resetOrderCounter(0);
                          setCurrentOrderCount(0);
                        }
                      }}
                      className="h-10 bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                    >
                      Reset Counter
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Order numbers are sequential (0001, 0002, 0003...) and increment automatically
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4 pr-4">
                <div className="space-y-3">
                  <Label className="text-slate-200">Available Payment Methods</Label>
                  <p className="text-xs text-slate-400 mb-3">Select at least one payment method</p>
                  {ALL_PAYMENT_METHODS.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 p-3 border border-slate-700 rounded-lg hover:bg-slate-800">
                      <Checkbox
                        id={`payment-${method.id}`}
                        checked={availablePaymentMethods.includes(method.id)}
                        onCheckedChange={() => togglePaymentMethod(method.id)}
                        disabled={availablePaymentMethods.includes(method.id) && availablePaymentMethods.length === 1}
                        className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label
                        htmlFor={`payment-${method.id}`}
                        className="flex-1 cursor-pointer text-base text-slate-200"
                      >
                        {method.label}
                      </Label>
                    </div>
                  ))}
                  <p className="text-xs text-slate-400 mt-2">
                    Selected: {availablePaymentMethods.length} of {ALL_PAYMENT_METHODS.length}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="delivery" className="space-y-4 pr-4">
                <div className="space-y-3">
                  <Label className="text-slate-200">Available Delivery Methods</Label>
                  <p className="text-xs text-slate-400 mb-3">Select at least one delivery method</p>
                  {ALL_DELIVERY_METHODS.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 p-3 border border-slate-700 rounded-lg hover:bg-slate-800">
                      <Checkbox
                        id={`delivery-${method.id}`}
                        checked={availableDeliveryMethods.includes(method.id)}
                        onCheckedChange={() => toggleDeliveryMethod(method.id)}
                        disabled={availableDeliveryMethods.includes(method.id) && availableDeliveryMethods.length === 1}
                        className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label
                        htmlFor={`delivery-${method.id}`}
                        className="flex-1 cursor-pointer text-base text-slate-200"
                      >
                        {method.label}
                      </Label>
                    </div>
                  ))}
                  <p className="text-xs text-slate-400 mt-2">
                    Selected: {availableDeliveryMethods.length} of {ALL_DELIVERY_METHODS.length}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-700">
                  <Label className="text-slate-200">Delivery Limits</Label>
                  
                  {/* Maximum Email Fields */}
                  <div className="space-y-2">
                    <Label htmlFor="maxEmails" className={`text-sm ${!availableDeliveryMethods.includes("email") ? "text-slate-500" : "text-slate-200"}`}>Maximum Email Fields</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 active:scale-95 transition-transform select-none border-3 border-slate-500 bg-slate-700 hover:bg-slate-600 hover:border-slate-400 shadow-md text-white"
                        onMouseDown={() => emailHold.start(maxNumberOfEmails, setMaxNumberOfEmails, "down")}
                        onMouseUp={() => emailHold.stop()}
                        onMouseLeave={() => emailHold.stop()}
                        disabled={!availableDeliveryMethods.includes("email") || maxNumberOfEmails <= 1}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      <div className={`flex-1 flex items-center justify-center rounded-lg h-12 border-3 shadow-md ${!availableDeliveryMethods.includes("email") ? "bg-slate-800 border-slate-600" : "bg-slate-700 border-slate-500"}`}>
                        <span className={`text-xl font-semibold ${!availableDeliveryMethods.includes("email") ? "text-slate-500" : "text-white"}`}>{maxNumberOfEmails}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 active:scale-95 transition-transform select-none border-3 border-slate-500 bg-slate-700 hover:bg-slate-600 hover:border-slate-400 shadow-md text-white"
                        onMouseDown={() => emailHold.start(maxNumberOfEmails, setMaxNumberOfEmails, "up")}
                        onMouseUp={() => emailHold.stop()}
                        onMouseLeave={() => emailHold.stop()}
                        disabled={!availableDeliveryMethods.includes("email") || maxNumberOfEmails >= 50}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">
                      {!availableDeliveryMethods.includes("email") 
                        ? "Email delivery must be enabled to adjust this setting" 
                        : "Maximum email fields on user info screen (1-50)"}
                    </p>
                  </div>

                  {/* Maximum Prints */}
                  <div className="space-y-2">
                    <Label htmlFor="maxPrints" className={`text-sm ${!availableDeliveryMethods.includes("prints") ? "text-slate-500" : "text-slate-200"}`}>Maximum Number of Prints</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 active:scale-95 transition-transform select-none border-3 border-slate-500 bg-slate-700 hover:bg-slate-600 hover:border-slate-400 shadow-md text-white"
                        onMouseDown={() => printHold.start(maxNumberOfPrints, setMaxNumberOfPrints, "down")}
                        onMouseUp={() => printHold.stop()}
                        onMouseLeave={() => printHold.stop()}
                        disabled={!availableDeliveryMethods.includes("prints") || maxNumberOfPrints <= 1}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      <div className={`flex-1 flex items-center justify-center rounded-lg h-12 border-3 shadow-md ${!availableDeliveryMethods.includes("prints") ? "bg-slate-800 border-slate-600" : "bg-slate-700 border-slate-500"}`}>
                        <span className={`text-xl font-semibold ${!availableDeliveryMethods.includes("prints") ? "text-slate-500" : "text-white"}`}>{maxNumberOfPrints}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 active:scale-95 transition-transform select-none border-3 border-slate-500 bg-slate-700 hover:bg-slate-600 hover:border-slate-400 shadow-md text-white"
                        onMouseDown={() => printHold.start(maxNumberOfPrints, setMaxNumberOfPrints, "up")}
                        onMouseUp={() => printHold.stop()}
                        onMouseLeave={() => printHold.stop()}
                        disabled={!availableDeliveryMethods.includes("prints") || maxNumberOfPrints >= 50}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">
                      {!availableDeliveryMethods.includes("prints") 
                        ? "Physical prints delivery must be enabled to adjust this setting" 
                        : "Maximum prints customers can order (1-50)"}
                    </p>
                  </div>

                  {/* Maximum Digital Backgrounds */}
                  <div className="space-y-2">
                    <Label htmlFor="maxDigitalBackgrounds" className={`text-sm ${!availableDeliveryMethods.includes("email") ? "text-slate-500" : "text-slate-200"}`}>Maximum Digital Backgrounds (Email)</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 active:scale-95 transition-transform select-none border-3 border-slate-500 bg-slate-700 hover:bg-slate-600 hover:border-slate-400 shadow-md text-white"
                        onMouseDown={() => bgHold.start(maxDigitalBackgrounds, setMaxDigitalBackgrounds, "down")}
                        onMouseUp={() => bgHold.stop()}
                        onMouseLeave={() => bgHold.stop()}
                        disabled={!availableDeliveryMethods.includes("email") || maxDigitalBackgrounds <= 1}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      <div className={`flex-1 flex items-center justify-center rounded-lg h-12 border-3 shadow-md ${!availableDeliveryMethods.includes("email") ? "bg-slate-800 border-slate-600" : "bg-slate-700 border-slate-500"}`}>
                        <span className={`text-xl font-semibold ${!availableDeliveryMethods.includes("email") ? "text-slate-500" : "text-white"}`}>{maxDigitalBackgrounds}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-12 w-12 active:scale-95 transition-transform select-none border-3 border-slate-500 bg-slate-700 hover:bg-slate-600 hover:border-slate-400 shadow-md text-white"
                        onMouseDown={() => bgHold.start(maxDigitalBackgrounds, setMaxDigitalBackgrounds, "up")}
                        onMouseUp={() => bgHold.stop()}
                        onMouseLeave={() => bgHold.stop()}
                        disabled={!availableDeliveryMethods.includes("email") || maxDigitalBackgrounds >= 50}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">
                      {!availableDeliveryMethods.includes("email") 
                        ? "Email delivery must be enabled to adjust this setting" 
                        : "Maximum backgrounds for email delivery (1-50)"}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="backgrounds" className="space-y-4 pr-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-200">Available Backgrounds</Label>
                    <Button
                      onClick={toggleAllBackgrounds}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                    >
                      {enabledBackgrounds.length === ALL_BACKGROUNDS.length ? "Deselect" : "Select"} All
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">Select at least one background</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_BACKGROUNDS.map((bg) => (
                      <div key={bg.id} className="flex items-center space-x-2 p-2 border border-slate-700 rounded-lg hover:bg-slate-800">
                        <Checkbox
                          id={`bg-${bg.id}`}
                          checked={enabledBackgrounds.includes(bg.id)}
                          onCheckedChange={() => toggleBackground(bg.id)}
                          disabled={enabledBackgrounds.includes(bg.id) && enabledBackgrounds.length === 1}
                          className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <Label
                          htmlFor={`bg-${bg.id}`}
                          className="flex-1 cursor-pointer text-sm text-slate-200"
                        >
                          {bg.id}. {bg.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Selected: {enabledBackgrounds.length} of {ALL_BACKGROUNDS.length} backgrounds
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-700">
                  <Label className="text-slate-200">Upload Custom Background</Label>
                  <Button
                    onClick={() => setEnableCustomBackgrounds(!enableCustomBackgrounds)}
                    variant={enableCustomBackgrounds ? "default" : "outline"}
                    className={`w-full h-auto p-4 text-left flex flex-col items-start gap-1 border-2 ${
                      enableCustomBackgrounds 
                        ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                        : "hover:bg-slate-800 text-slate-200 border-slate-600 bg-slate-700"
                    }`}
                  >
                    <span className="text-base">
                      {enableCustomBackgrounds ? "✓ Upload Custom Background Enabled" : "Enable Upload Custom Background"}
                    </span>
                    <span className={`text-xs ${enableCustomBackgrounds ? "text-green-100" : "text-slate-400"}`}>
                      {enableCustomBackgrounds 
                        ? "Users can upload their own custom background images" 
                        : "Click to allow users to upload their own background images"}
                    </span>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <UploadFinalPhotoTab />
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <OrderHistoryTab />
              </TabsContent>
            </ScrollArea>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <Button
                onClick={handleSave}
                className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="mr-2 w-5 h-5" />
                Save All Settings
              </Button>
            </div>
          </Tabs>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}