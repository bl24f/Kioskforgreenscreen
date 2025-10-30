import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Card } from "./ui/card";
import { ArrowLeft, ArrowRight, X, Minus, Plus, Settings } from "lucide-react";
import { CancelConfirmationDialog } from "./CancelConfirmationDialog";
import { AdminDialog } from "./AdminDialog";
import { AdminPasswordDialog } from "./AdminPasswordDialog";
import { PriceSummary } from "./PriceSummary";

interface DeliveryPaymentScreenProps {
  deliveryMethod: string[];
  setDeliveryMethod: (value: string[]) => void;
  numberOfPhotos: string;
  setNumberOfPhotos: (value: string) => void;
  numberOfEmailPhotos: string;
  setNumberOfEmailPhotos: (value: string) => void;
  paymentType: string;
  setPaymentType: (value: string) => void;
  basePrice: string;
  selectedBackgrounds: (number | string)[];
  availablePaymentMethods: string[];
  availableDeliveryMethods: string[];
  maxNumberOfPhotos: number;
  maxNumberOfEmails: number;
  maxNumberOfPrints: number;
  isFreeDay: boolean;
  showFreeDayOption: boolean;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  // Admin settings props
  setBasePrice?: (value: string) => void;
  theme?: string;
  setTheme?: (value: string) => void;
  setAvailablePaymentMethods?: (value: string[]) => void;
  setAvailableDeliveryMethods?: (value: string[]) => void;
  setMaxNumberOfPhotos?: (value: number) => void;
  setMaxNumberOfEmails?: (value: number) => void;
  setMaxNumberOfPrints?: (value: number) => void;
  enabledBackgrounds?: number[];
  setEnabledBackgrounds?: (value: number[]) => void;
  enableCustomBackgrounds?: boolean;
  setEnableCustomBackgrounds?: (value: boolean) => void;
  setIsFreeDay?: (value: boolean) => void;
  setShowFreeDayOption?: (value: boolean) => void;
}

export function DeliveryPaymentScreen({
  deliveryMethod,
  setDeliveryMethod,
  numberOfPhotos,
  setNumberOfPhotos,
  numberOfEmailPhotos,
  setNumberOfEmailPhotos,
  paymentType,
  setPaymentType,
  basePrice,
  selectedBackgrounds,
  availablePaymentMethods,
  availableDeliveryMethods,
  maxNumberOfPhotos,
  maxNumberOfEmails,
  maxNumberOfPrints,
  isFreeDay,
  showFreeDayOption,
  onNext,
  onBack,
  onCancel,
  setBasePrice,
  theme = "",
  setTheme,
  setAvailablePaymentMethods,
  setAvailableDeliveryMethods,
  setMaxNumberOfPhotos,
  setMaxNumberOfEmails,
  setMaxNumberOfPrints,
  enabledBackgrounds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  setEnabledBackgrounds,
  enableCustomBackgrounds = false,
  setEnableCustomBackgrounds,
  setIsFreeDay,
  setShowFreeDayOption,
}: DeliveryPaymentScreenProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const price = parseFloat(basePrice) || 0;
  const photos = parseInt(numberOfPhotos) || 1;
  const printCost = deliveryMethod.includes("prints") ? photos * 2 : 0;
  
  // Count custom backgrounds (string IDs) and calculate cost
  const customBackgroundCount = selectedBackgrounds.filter(id => typeof id === 'string').length;
  const customBackgroundCost = customBackgroundCount * 5;
  
  // If it's a free day, override all pricing to 0
  const totalPrice = isFreeDay ? 0 : price + printCost + customBackgroundCost;

  const decrementPhotos = () => {
    const current = parseInt(numberOfPhotos) || 1;
    if (current > 1) {
      setNumberOfPhotos((current - 1).toString());
    }
  };

  const incrementPhotos = () => {
    const current = parseInt(numberOfPhotos) || 1;
    if (current < maxNumberOfPrints) {
      setNumberOfPhotos((current + 1).toString());
    }
  };

  const toggleDeliveryMethod = (method: string) => {
    if (deliveryMethod.includes(method)) {
      // Don't allow removing if it's the last method
      if (deliveryMethod.length > 1) {
        setDeliveryMethod(deliveryMethod.filter((m) => m !== method));
      }
    } else {
      setDeliveryMethod([...deliveryMethod, method]);
    }
  };

  const handleGearClick = () => {
    clickCountRef.current += 1;
    
    // Clear any existing timer
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    
    // If we reached 3 clicks, open the password dialog
    if (clickCountRef.current === 3) {
      setShowPasswordDialog(true);
      clickCountRef.current = 0;
    } else {
      // Reset click count after 1 second if we haven't reached 3 clicks
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 1000);
    }
  };

  const handlePasswordCorrect = () => {
    setShowAdminDialog(true);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-8">
      {/* Hidden Admin Button */}
      <Button
        onClick={handleGearClick}
        variant="ghost"
        size="sm"
        className="fixed top-24 right-4 opacity-0 hover:opacity-0 active:scale-95 transition-all select-none z-50 w-40 h-40"
      >
        <Settings className="w-20 h-20" />
      </Button>
      
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-2xl space-y-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl text-slate-900">Delivery & Payment</h2>
            <Button
              onClick={onBack}
              size="lg"
              className="h-14 px-8 text-lg active:scale-95 transition-all select-none bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg border-0"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back
            </Button>
          </div>

          {/* Delivery Method */}
          <div className="space-y-4">
            <Label className="text-xl text-slate-800">Choose Delivery Method (Select all that apply)</Label>
            <div className="space-y-3">
              {/* Email Option */}
              {availableDeliveryMethods.includes("email") && (
                <div 
                  className={`p-5 border-2 rounded-xl cursor-pointer transition-colors select-none ${
                    deliveryMethod.includes("email") ? "bg-blue-100 border-blue-500" : "hover:bg-slate-50 border-slate-300"
                  }`}
                  onClick={() => toggleDeliveryMethod("email")}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={deliveryMethod.includes("email")}
                      onCheckedChange={() => toggleDeliveryMethod("email")}
                      id="email"
                      className="h-6 w-6"
                    />
                    <Label className="cursor-pointer flex-1 text-lg text-slate-800">
                      Email (Digital Delivery)
                    </Label>
                  </div>
                </div>
              )}

              {/* Prints Option */}
              {availableDeliveryMethods.includes("prints") && (
                <div 
                  className={`p-5 border-2 rounded-xl cursor-pointer transition-colors select-none ${
                    deliveryMethod.includes("prints") ? "bg-blue-100 border-blue-500" : "hover:bg-slate-50 border-slate-300"
                  }`}
                  onClick={() => toggleDeliveryMethod("prints")}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={deliveryMethod.includes("prints")}
                      onCheckedChange={() => toggleDeliveryMethod("prints")}
                      id="prints"
                      className="h-6 w-6"
                    />
                    <Label className="cursor-pointer flex-1 text-lg text-slate-800">
                      Prints (+$2.00 per photo)
                    </Label>
                  </div>
                </div>
              )}
            </div>

            {/* Number of Prints - shown when prints is selected */}
            {deliveryMethod.includes("prints") && (
              <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-xl border-2 border-slate-200">
                <span className="text-slate-700 text-lg">Number of Prints:</span>
                <Button
                  type="button"
                  onClick={decrementPhotos}
                  disabled={photos <= 1}
                  size="sm"
                  variant="outline"
                  className="h-12 w-12 active:scale-95 transition-transform select-none disabled:opacity-30 border-3 border-slate-600 bg-slate-100 text-slate-900 hover:bg-slate-200 hover:border-slate-700 shadow-md font-semibold"
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <div className="w-16 h-12 border-3 border-slate-600 rounded-lg flex items-center justify-center bg-white shadow-md">
                  <span className="text-2xl text-slate-900 font-semibold">{photos}</span>
                </div>
                <Button
                  type="button"
                  onClick={incrementPhotos}
                  disabled={photos >= maxNumberOfPrints}
                  size="sm"
                  variant="outline"
                  className="h-12 w-12 active:scale-95 transition-transform select-none disabled:opacity-30 border-3 border-slate-600 bg-slate-100 text-slate-900 hover:bg-slate-200 hover:border-slate-700 shadow-md font-semibold"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Payment Type */}
          <div className="space-y-4">
            <Label className="text-xl text-slate-800">Payment Method</Label>
            <RadioGroup value={paymentType} onValueChange={setPaymentType}>
              <div className="space-y-3">
                {availablePaymentMethods.map((method) => {
                  const getDisplayName = (method: string) => {
                    switch (method) {
                      case "debit":
                        return "Debit Card";
                      case "credit":
                        return "Credit Card";
                      default:
                        return method.charAt(0).toUpperCase() + method.slice(1);
                    }
                  };

                  const isSelected = paymentType === method;

                  return (
                    <div 
                      key={method} 
                      className={`flex items-center space-x-3 p-5 border-2 rounded-xl cursor-pointer transition-colors select-none min-h-[60px] ${
                        isSelected ? "bg-blue-100 border-blue-500" : "hover:bg-slate-50 border-slate-300"
                      }`}
                      onClick={() => setPaymentType(method)}
                    >
                      <RadioGroupItem value={method} id={method} />
                      <Label htmlFor={method} className="cursor-pointer flex-1 text-lg text-slate-800">
                        {getDisplayName(method)}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => setShowCancelDialog(true)}
              variant="destructive"
              size="lg"
              className="h-16 text-lg flex-1 active:scale-95 transition-transform select-none"
            >
              <X className="mr-2" />
              Cancel
            </Button>
            <Button
              onClick={onNext}
              size="lg"
              className="h-16 text-lg flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 active:scale-95 transition-all select-none"
            >
              Next
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-200">
          <h3 className="text-2xl text-slate-900 mb-6">Price Summary</h3>
          <PriceSummary
            basePrice={basePrice}
            numberOfPhotos={numberOfPhotos}
            deliveryMethod={deliveryMethod}
            selectedBackgrounds={selectedBackgrounds}
            isFreeDay={isFreeDay}
          />
        </div>
      </div>

      <CancelConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={onCancel}
      />
      
      <AdminPasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onPasswordCorrect={handlePasswordCorrect}
      />
      
      {setBasePrice && setTheme && setAvailablePaymentMethods && setAvailableDeliveryMethods && 
       setMaxNumberOfPhotos && setMaxNumberOfEmails && setMaxNumberOfPrints && 
       setEnabledBackgrounds && setEnableCustomBackgrounds && setIsFreeDay && setShowFreeDayOption && (
        <AdminDialog
          open={showAdminDialog}
          onOpenChange={setShowAdminDialog}
          basePrice={basePrice}
          setBasePrice={setBasePrice}
          theme={theme}
          setTheme={setTheme}
          availablePaymentMethods={availablePaymentMethods}
          setAvailablePaymentMethods={setAvailablePaymentMethods}
          availableDeliveryMethods={availableDeliveryMethods}
          setAvailableDeliveryMethods={setAvailableDeliveryMethods}
          maxNumberOfPhotos={maxNumberOfPhotos}
          setMaxNumberOfPhotos={setMaxNumberOfPhotos}
          maxNumberOfEmails={maxNumberOfEmails}
          setMaxNumberOfEmails={setMaxNumberOfEmails}
          maxNumberOfPrints={maxNumberOfPrints}
          setMaxNumberOfPrints={setMaxNumberOfPrints}
          enabledBackgrounds={enabledBackgrounds}
          setEnabledBackgrounds={setEnabledBackgrounds}
          enableCustomBackgrounds={enableCustomBackgrounds}
          setEnableCustomBackgrounds={setEnableCustomBackgrounds}
          isFreeDay={isFreeDay}
          setIsFreeDay={setIsFreeDay}
          showFreeDayOption={showFreeDayOption}
          setShowFreeDayOption={setShowFreeDayOption}
        />
      )}
    </div>
  );
}