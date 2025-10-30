import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Logo } from "./Logo";
import { AdminDialog } from "./AdminDialog";
import { AdminPasswordDialog } from "./AdminPasswordDialog";
import { Settings } from "lucide-react";

interface HomeScreenProps {
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
  onStart: () => void;
}

export function HomeScreen({ 
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
  onStart 
}: HomeScreenProps) {
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    <div className="h-screen w-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-8 relative">
      {/* Admin Button - Invisible but functional */}
      <Button
        onClick={handleGearClick}
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 opacity-0 hover:opacity-0 active:scale-95 transition-all select-none w-40 h-40"
      >
        <Settings className="w-20 h-20" />
      </Button>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-8">
          {/* Logo */}
          <div className="bg-white rounded-3xl p-10 border-2 border-green-500/20">
            <Logo size="lg" showText={true} />
          </div>

          {/* Theme Display */}
          {theme && (
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl text-center border border-slate-200">
              <p className="text-slate-600">Today's Special Theme</p>
              <p className="text-3xl text-green-600 mt-2">{theme}</p>
            </div>
          )}

          {/* Start Button */}
          <Button
            onClick={onStart}
            size="lg"
            className="
              h-32 w-full max-w-2xl text-4xl
              bg-gradient-to-t from-amber-400 to-yellow-300 shadow-2xl
              border-4 border-amber-500
              hover:from-amber-500 hover:to-yellow-300 hover:shadow-xl
              active:from-amber-600 active:to-yellow-600 active:scale-95
              text-gray-900 hover:text-black rounded-2xl
              transform transition-all select-none
            ">
            TAP HERE TO START
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200">
          <h2 className="text-3xl mb-6 text-slate-900">How to Use</h2>
          <ol className="space-y-4 text-lg text-slate-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">1</span>
              <span>Use this program to choose a backdrop for your green screen photo</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">2</span>
              <span>Select your delivery method (email or prints)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">3</span>
              <span>Choose from our amazing collection of backgrounds</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">4</span>
              <span>Enter your information and confirm your selection</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">5</span>
              <span>Take a short photo (optional)</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">6</span>
              <span>Complete payment and grab you receipt!</span>
            </li>
          </ol>
        </div>
      </div>

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
        maxDigitalBackgrounds={maxDigitalBackgrounds}
        setMaxDigitalBackgrounds={setMaxDigitalBackgrounds}
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