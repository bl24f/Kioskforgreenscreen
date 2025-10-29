import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Check, X, ArrowLeft, Edit, Settings } from "lucide-react";
import { CancelConfirmationDialog } from "./CancelConfirmationDialog";
import { AdminDialog } from "./AdminDialog";
import { AdminPasswordDialog } from "./AdminPasswordDialog";
import { PriceSummary } from "./PriceSummary";

interface ConfirmationScreenProps {
  userName: string;
  emails: string[];
  numberOfPeople: string;
  selectedBackgrounds: (number | string)[];
  deliveryMethod: string[];
  numberOfPhotos: string;
  paymentType: string;
  basePrice: string;
  theme: string;
  isFreeDay: boolean;
  onConfirm: () => void;
  onQuit: () => void;
  onBack: () => void;
  onEditPersonalInfo: () => void;
  onEditDelivery: () => void;
  onEditBackground: () => void;
  onEditQuickPhoto: () => void;
  onEditBackgroundOutputs?: () => void;
  // Admin settings props
  setBasePrice?: (value: string) => void;
  setTheme?: (value: string) => void;
  availablePaymentMethods?: string[];
  setAvailablePaymentMethods?: (value: string[]) => void;
  availableDeliveryMethods?: string[];
  setAvailableDeliveryMethods?: (value: string[]) => void;
  maxNumberOfPhotos?: number;
  setMaxNumberOfPhotos?: (value: number) => void;
  maxNumberOfEmails?: number;
  setMaxNumberOfEmails?: (value: number) => void;
  maxNumberOfPrints?: number;
  setMaxNumberOfPrints?: (value: number) => void;
  enabledBackgrounds?: number[];
  setEnabledBackgrounds?: (value: number[]) => void;
  enableCustomBackgrounds?: boolean;
  setEnableCustomBackgrounds?: (value: boolean) => void;
  setIsFreeDay?: (value: boolean) => void;
  showFreeDayOption?: boolean;
  setShowFreeDayOption?: (value: boolean) => void;
}

const backgrounds = [
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

const customBackgroundNames: { [key: string]: string } = {
  "custom-1": "Christmas Tree",
  "custom-2": "Halloween Pumpkins",
  "custom-3": "Valentine Hearts",
  "custom-4": "Birthday Party",
  "custom-5": "Wedding Day",
  "custom-6": "Graduation Day",
  "custom-7": "Superhero",
  "custom-8": "Outer Space",
  "custom-9": "Retro 80s",
  "custom-10": "Neon City",
  "custom-11": "Football Field",
  "custom-12": "Basketball Court",
  "custom-13": "Baseball Stadium",
  "custom-14": "Cute Puppy",
  "custom-15": "Rainbow Fun",
  "custom-16": "Gold Sparkle",
  "custom-17": "Business Office",
  "custom-18": "Fireworks Show",
  "custom-19": "Easter Eggs",
  "custom-20": "Fourth of July",
  "custom-21": "Teaching Tech",
  "custom-22": "Tech Class",
  "custom-23": "Phone Lesson",
};

export function ConfirmationScreen({
  userName,
  emails,
  numberOfPeople,
  selectedBackgrounds,
  deliveryMethod,
  numberOfPhotos,
  paymentType,
  basePrice,
  theme,
  isFreeDay,
  onConfirm,
  onQuit,
  onBack,
  onEditPersonalInfo,
  onEditDelivery,
  onEditBackground,
  onEditQuickPhoto,
  onEditBackgroundOutputs,
  setBasePrice,
  setTheme,
  availablePaymentMethods = ["cash", "debit", "credit", "check"],
  setAvailablePaymentMethods,
  availableDeliveryMethods = ["email", "prints"],
  setAvailableDeliveryMethods,
  maxNumberOfPhotos = 10,
  setMaxNumberOfPhotos,
  maxNumberOfEmails = 5,
  setMaxNumberOfEmails,
  maxNumberOfPrints = 20,
  setMaxNumberOfPrints,
  enabledBackgrounds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  setEnabledBackgrounds,
  enableCustomBackgrounds = false,
  setEnableCustomBackgrounds,
  setIsFreeDay,
  showFreeDayOption = false,
  setShowFreeDayOption,
}: ConfirmationScreenProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const price = parseFloat(basePrice) || 0;
  const photos = parseInt(numberOfPhotos) || 1;
  const printCost = deliveryMethod.includes("prints") ? photos * 2 : 0;
  
  // Separate standard, extra, and uploaded custom backgrounds
  const standardBackgrounds = backgrounds.filter(bg => selectedBackgrounds.includes(bg.id));
  
  // Extra backgrounds: string IDs that start with "custom-" but NOT "uploaded-custom-" (FREE)
  const extraBackgroundIds = selectedBackgrounds.filter(id => 
    typeof id === 'string' && 
    String(id).startsWith('custom-') && 
    !String(id).startsWith('uploaded-custom-')
  ) as string[];
  const selectedExtraBackgrounds = extraBackgroundIds.map(id => ({
    id,
    name: customBackgroundNames[id] || id
  }));
  
  // Uploaded custom backgrounds: string IDs that start with "uploaded-custom-" ($5.00 each)
  const uploadedCustomBackgroundIds = selectedBackgrounds.filter(id => 
    typeof id === 'string' && 
    String(id).startsWith('uploaded-custom-')
  ) as string[];
  const selectedUploadedCustomBackgrounds = uploadedCustomBackgroundIds.map(id => ({
    id,
    name: customBackgroundNames[id] || id
  }));
  
  // Calculate cost for uploaded custom backgrounds ($5.00 each)
  const uploadedCustomBackgroundCost = uploadedCustomBackgroundIds.length * 5;
  
  // Calculate additional background cost: First background is free, each additional is $2.50
  // Count total non-extra backgrounds (standard + uploaded custom)
  const totalChargableBackgrounds = standardBackgrounds.length + uploadedCustomBackgroundIds.length;
  const additionalBackgroundCount = Math.max(0, totalChargableBackgrounds - 1);
  const additionalBackgroundCost = additionalBackgroundCount * 2.5;
  
  // If it's a free day, override all pricing to 0
  const totalPrice = isFreeDay ? 0 : price + printCost + uploadedCustomBackgroundCost + additionalBackgroundCost;

  const validEmails = emails.filter((e) => e.trim() !== "");

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
    <div className="min-h-screen w-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-600 flex items-center justify-center p-8">
      {/* Hidden Admin Button */}
      <Button
        onClick={handleGearClick}
        variant="ghost"
        size="sm"
        className="fixed top-24 right-4 opacity-0 hover:opacity-0 active:scale-95 transition-all select-none z-50 w-20 h-20"
      >
        <Settings className="w-10 h-10" />
      </Button>
      <div className="max-w-4xl w-full bg-white rounded-2xl p-8 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-4xl text-slate-900">Confirm Your Order</h2>
          <Button
            onClick={onBack}
            size="lg"
            className="h-14 px-8 text-lg active:scale-95 transition-all select-none bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg border-0"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Personal Info */}
          <Card className="p-6 space-y-3 bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl text-slate-900">Personal Information</h3>
              <Button
                onClick={onEditPersonalInfo}
                variant="outline"
                size="sm"
                className="h-11 px-5 active:scale-95 transition-all select-none border-3 border-purple-600 bg-purple-100 text-purple-800 hover:bg-purple-200 hover:border-purple-700 shadow-md font-semibold"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
            <div>
              <span className="text-slate-600">Name: </span>
              <span className="text-slate-900">{userName}</span>
            </div>
            <div>
              <span className="text-slate-600">People in Photo: </span>
              <span className="text-slate-900">{numberOfPeople}</span>
            </div>
            {validEmails.length > 0 && (
              <div>
                <span className="text-slate-600">Email(s): </span>
                <div className="mt-1 space-y-1">
                  {validEmails.map((email, index) => (
                    <div key={index} className="text-slate-900 text-sm">
                      {email}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Order Details */}
          <Card className="p-6 space-y-3 bg-slate-50 border-slate-200">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl text-slate-900">Order Details</h3>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={onEditBackground}
                  variant="outline"
                  size="sm"
                  className="h-11 flex-1 active:scale-95 transition-all select-none border-3 border-purple-600 bg-purple-100 text-purple-800 hover:bg-purple-200 hover:border-purple-700 shadow-md font-semibold"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Background
                </Button>
                <Button
                  onClick={onEditDelivery}
                  variant="outline"
                  size="sm"
                  className="h-11 flex-1 active:scale-95 transition-all select-none border-3 border-purple-600 bg-purple-100 text-purple-800 hover:bg-purple-200 hover:border-purple-700 shadow-md font-semibold"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Delivery
                </Button>
              </div>
            </div>
            <div>
              <span className="text-slate-600">Theme: </span>
              <span className="text-slate-900">{theme || "Not specified"}</span>
            </div>
            {standardBackgrounds.length > 0 && (
              <div>
                <span className="text-slate-600">Standard Backgrounds ({standardBackgrounds.length}): </span>
                <div className="mt-1 space-y-1">
                  {standardBackgrounds.map((bg, index) => (
                    <div key={bg.id} className="text-slate-900 text-sm">
                      {index + 1}. {bg.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedExtraBackgrounds.length > 0 && (
              <div>
                <span className="text-slate-600">Extra Backgrounds ({selectedExtraBackgrounds.length}): </span>
                <div className="mt-1 space-y-1">
                  {selectedExtraBackgrounds.map((bg, index) => (
                    <div key={bg.id} className="text-slate-900 text-sm">
                      {index + 1}. {bg.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedUploadedCustomBackgrounds.length > 0 && (
              <div>
                <span className="text-slate-600">Custom Backgrounds ({selectedUploadedCustomBackgrounds.length}): </span>
                <div className="mt-1 space-y-1">
                  {selectedUploadedCustomBackgrounds.map((bg, index) => (
                    <div key={bg.id} className="text-slate-900 text-sm">
                      {index + 1}. {bg.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div>
              <span className="text-slate-600">Delivery: </span>
              <span className="text-slate-900 capitalize">
                {deliveryMethod.length === 0 ? "Not selected" : deliveryMethod.join(" & ")}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Number of Prints: </span>
              <span className="text-slate-900">{numberOfPhotos}</span>
            </div>
            <div>
              <span className="text-slate-600">Payment: </span>
              <span className="text-slate-900 capitalize">
                {!paymentType ? "Not selected" : (() => {
                  switch (paymentType) {
                    case "debit":
                      return "Debit Card";
                    case "credit":
                      return "Credit Card";
                    default:
                      return paymentType.charAt(0).toUpperCase() + paymentType.slice(1);
                  }
                })()}
              </span>
            </div>
          </Card>
        </div>

        {/* Total Price */}
        <div className="mb-8">
          <PriceSummary
            basePrice={basePrice}
            numberOfPhotos={numberOfPhotos}
            deliveryMethod={deliveryMethod}
            selectedBackgrounds={selectedBackgrounds}
            isFreeDay={isFreeDay}
          />
        </div>

        {/* Confirmation Question */}
        <div className="text-center mb-6">
          <p className="text-2xl text-slate-900">Is all information correct?</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => setShowCancelDialog(true)}
            variant="destructive"
            size="lg"
            className="h-20 text-xl flex-1 active:scale-95 transition-transform select-none"
          >
            <X className="mr-2 w-6 h-6" />
            No, Cancel Order
          </Button>
          <Button
            onClick={onConfirm}
            size="lg"
            className="h-20 text-xl flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 active:scale-95 transition-all select-none"
          >
            <Check className="mr-2 w-6 h-6" />
            Yes, It's Correct!
          </Button>
        </div>
      </div>

      <CancelConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={onQuit}
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