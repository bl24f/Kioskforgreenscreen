import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { KeyboardInput } from "./KeyboardInput";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, ArrowRight, X, Minus, Plus, AlertCircle, Trash2, Settings } from "lucide-react";
import { CancelConfirmationDialog } from "./CancelConfirmationDialog";
import { AdminDialog } from "./AdminDialog";
import { AdminPasswordDialog } from "./AdminPasswordDialog";
import { PriceSummary } from "./PriceSummary";

interface UserInfoScreenProps {
  userName: string;
  setUserName: (value: string) => void;
  emails: string[];
  setEmails: (value: string[]) => void;
  maxNumberOfEmails: number;
  numberOfPeople: string;
  setNumberOfPeople: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  // Pricing props
  deliveryMethod?: string[];
  numberOfPhotos?: string;
  selectedBackgrounds?: (number | string)[];
  // Admin settings props
  basePrice?: string;
  setBasePrice?: (value: string) => void;
  theme?: string;
  setTheme?: (value: string) => void;
  availablePaymentMethods?: string[];
  setAvailablePaymentMethods?: (value: string[]) => void;
  availableDeliveryMethods?: string[];
  setAvailableDeliveryMethods?: (value: string[]) => void;
  maxNumberOfPhotos?: number;
  setMaxNumberOfPhotos?: (value: number) => void;
  setMaxNumberOfEmails?: (value: number) => void;
  maxNumberOfPrints?: number;
  setMaxNumberOfPrints?: (value: number) => void;
  enabledBackgrounds?: number[];
  setEnabledBackgrounds?: (value: number[]) => void;
  enableCustomBackgrounds?: boolean;
  setEnableCustomBackgrounds?: (value: boolean) => void;
  isFreeDay?: boolean;
  setIsFreeDay?: (value: boolean) => void;
  showFreeDayOption?: boolean;
  setShowFreeDayOption?: (value: boolean) => void;
}

export function UserInfoScreen({
  userName,
  setUserName,
  emails,
  setEmails,
  maxNumberOfEmails,
  numberOfPeople,
  setNumberOfPeople,
  onNext,
  onBack,
  onCancel,
  deliveryMethod = [],
  numberOfPhotos = "1",
  selectedBackgrounds = [],
  basePrice = "10.00",
  setBasePrice,
  theme = "",
  setTheme,
  availablePaymentMethods = ["cash", "debit", "credit", "check"],
  setAvailablePaymentMethods,
  availableDeliveryMethods = ["email", "prints"],
  setAvailableDeliveryMethods,
  maxNumberOfPhotos = 10,
  setMaxNumberOfPhotos,
  setMaxNumberOfEmails,
  maxNumberOfPrints = 20,
  setMaxNumberOfPrints,
  enabledBackgrounds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  setEnabledBackgrounds,
  enableCustomBackgrounds = false,
  setEnableCustomBackgrounds,
  isFreeDay = false,
  setIsFreeDay,
  showFreeDayOption = false,
  setShowFreeDayOption,
}: UserInfoScreenProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [emailErrors, setEmailErrors] = useState<Record<number, string>>({});
  const [numberOfEmailFields, setNumberOfEmailFields] = useState(1);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [activeKeyboardId, setActiveKeyboardId] = useState<string | null>(null);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const people = parseInt(numberOfPeople) || 1;

  const validateEmail = (email: string): boolean => {
    if (email.trim() === "") return true; // Empty is valid (except email 0)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    // Ensure the array is large enough
    while (newEmails.length <= index) {
      newEmails.push("");
    }
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleEmailBlur = (emailIndex: number, value: string) => {
    const trimmedValue = value.trim();
    
    if (emailIndex === 0 && trimmedValue === "") {
      setEmailErrors(prev => ({ ...prev, [emailIndex]: "Email 1 is required" }));
      return;
    }

    if (trimmedValue !== "" && !validateEmail(trimmedValue)) {
      setEmailErrors(prev => ({ ...prev, [emailIndex]: "Please enter a valid email address" }));
    } else {
      setEmailErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[emailIndex];
        return newErrors;
      });
    }
  };

  const isEmail1Valid = (emails[0] || "").trim() !== "" && validateEmail(emails[0] || "");

  const decrementPeople = () => {
    const current = parseInt(numberOfPeople) || 1;
    if (current > 1) {
      setNumberOfPeople((current - 1).toString());
    }
  };

  const incrementPeople = () => {
    const current = parseInt(numberOfPeople) || 1;
    if (current < 9) {
      setNumberOfPeople((current + 1).toString());
    } else if (current === 9) {
      setNumberOfPeople("10+");
    }
  };

  const displayPeople = numberOfPeople === "10+" ? "10+" : people.toString();

  const addEmailField = () => {
    if (numberOfEmailFields < maxNumberOfEmails) {
      setNumberOfEmailFields(numberOfEmailFields + 1);
    }
  };

  const removeEmailField = (index: number) => {
    if (index === 0) return; // Can't remove the first email
    
    // Remove the email from the array
    const newEmails = [...emails];
    newEmails.splice(index, 1);
    setEmails(newEmails);
    
    // Remove any errors for this field
    const newErrors = { ...emailErrors };
    delete newErrors[index];
    // Shift down error indices
    const updatedErrors: Record<number, string> = {};
    Object.keys(newErrors).forEach(key => {
      const idx = parseInt(key);
      if (idx > index) {
        updatedErrors[idx - 1] = newErrors[idx];
      } else {
        updatedErrors[idx] = newErrors[idx];
      }
    });
    setEmailErrors(updatedErrors);
    
    setNumberOfEmailFields(numberOfEmailFields - 1);
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
    <div className="min-h-screen w-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center p-8">
      {/* Hidden Admin Button */}
      <Button
        onClick={handleGearClick}
        variant="ghost"
        size="sm"
        className="fixed top-24 right-4 opacity-0 hover:opacity-0 active:scale-95 transition-all select-none z-50 w-40 h-40"
      >
        <Settings className="w-20 h-20" />
      </Button>
      <div className="max-w-3xl w-full bg-white rounded-2xl p-8 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl text-slate-900">Your Information</h2>
          <Button
            onClick={onBack}
            size="lg"
            className="h-14 px-8 text-lg active:scale-95 transition-all select-none bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg border-0"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </Button>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="userName" className="text-xl text-slate-800">
              Name *
            </Label>
            <KeyboardInput
              id="userName"
              value={userName}
              onChange={setUserName}
              placeholder="Enter your name"
              className="h-16 text-lg"
              isKeyboardVisible={activeKeyboardId === "userName"}
              onFocus={() => setActiveKeyboardId("userName")}
              onCloseKeyboard={() => setActiveKeyboardId(null)}
            />
          </div>

          {/* Email Addresses */}
          <div className="space-y-4">
            <Label className="text-xl text-slate-800">
              Email Address{numberOfEmailFields > 1 ? "es" : ""} *
            </Label>
            
            {Array.from({ length: numberOfEmailFields }).map((_, index) => {
              const isFirst = index === 0;
              const emailValue = emails[index] || "";
              const hasError = emailErrors[index];

              return (
                <div key={index} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <KeyboardInput
                        id={`userEmail-${index}`}
                        value={emailValue}
                        onChange={(value) => handleEmailChange(index, value)}
                        onBlur={() => handleEmailBlur(index, emailValue)}
                        type="email"
                        placeholder={isFirst ? "Enter your email address" : `Additional email address ${index + 1}`}
                        className={`h-16 text-lg ${hasError ? "!border-red-500 focus-visible:ring-red-500" : ""}`}
                        fieldLabel={isFirst ? "Email Address" : `Email Address ${index + 1}`}
                        isKeyboardVisible={activeKeyboardId === `userEmail-${index}`}
                        onFocus={() => setActiveKeyboardId(`userEmail-${index}`)}
                        onCloseKeyboard={() => setActiveKeyboardId(null)}
                      />
                    </div>
                    {!isFirst && (
                      <Button
                        type="button"
                        onClick={() => removeEmailField(index)}
                        variant="outline"
                        size="lg"
                        className="h-16 w-16 text-red-700 hover:bg-red-200 hover:text-red-800 active:scale-95 transition-all select-none border-3 border-red-500 bg-red-100 shadow-md font-semibold"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                  {hasError && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm ml-2">
                        {hasError}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}

            {/* Add Email Button */}
            {numberOfEmailFields < maxNumberOfEmails && (
              <Button
                type="button"
                onClick={addEmailField}
                variant="outline"
                size="lg"
                className="w-full h-14 text-lg border-3 border-dashed border-blue-600 bg-blue-100 hover:border-blue-700 hover:bg-blue-200 hover:text-blue-800 active:scale-95 transition-all select-none text-blue-700 shadow-md font-semibold"
              >
                <Plus className="mr-2 w-5 h-5" />
                Add Another Email Address
              </Button>
            )}
          </div>

          {/* Number of People */}
          <div className="space-y-2">
            <Label className="text-xl text-slate-800">Number of People in Photo</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                onClick={decrementPeople}
                disabled={people <= 1}
                size="lg"
                variant="outline"
                className="h-16 w-16 text-2xl active:scale-95 transition-transform select-none disabled:opacity-30 border-3 border-slate-600 bg-slate-100 text-slate-900 hover:bg-slate-200 hover:border-slate-700 shadow-md font-semibold"
              >
                <Minus />
              </Button>
              <div className="flex-1 h-16 bg-white border-3 border-slate-600 rounded-md flex items-center justify-center text-2xl text-slate-900 shadow-md font-semibold">
                {displayPeople}
              </div>
              <Button
                type="button"
                onClick={incrementPeople}
                disabled={numberOfPeople === "10+"}
                size="lg"
                variant="outline"
                className="h-16 w-16 text-2xl active:scale-95 transition-transform select-none disabled:opacity-30 border-3 border-slate-600 bg-slate-100 text-slate-900 hover:bg-slate-200 hover:border-slate-700 shadow-md font-semibold"
              >
                <Plus />
              </Button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="pt-4">
            <PriceSummary
              basePrice={basePrice}
              numberOfPhotos={numberOfPhotos}
              deliveryMethod={deliveryMethod}
              selectedBackgrounds={selectedBackgrounds}
              isFreeDay={isFreeDay}
            />
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
              disabled={!isEmail1Valid}
              size="lg"
              className="h-16 text-lg flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all select-none"
            >
              Next
              <ArrowRight className="ml-2" />
            </Button>
          </div>
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
    </div>
  );
}