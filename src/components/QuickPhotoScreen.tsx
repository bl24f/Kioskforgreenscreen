import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight, Camera, RotateCcw, X, Settings } from "lucide-react";
import { CancelConfirmationDialog } from "./CancelConfirmationDialog";
import { AdminDialog } from "./AdminDialog";
import { AdminPasswordDialog } from "./AdminPasswordDialog";

interface QuickPhotoScreenProps {
  numberOfPeople: string;
  selectedBackgrounds: (number | string)[];
  capturedPhotos: string[];
  setCapturedPhotos: (photos: string[]) => void;
  customerNumber: string;
  orderNumber: string;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
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
  maxNumberOfEmails?: number;
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

export function QuickPhotoScreen({
  numberOfPeople,
  selectedBackgrounds,
  capturedPhotos,
  setCapturedPhotos,
  customerNumber,
  orderNumber,
  onNext,
  onBack,
  onCancel,
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
  maxNumberOfEmails = 5,
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
}: QuickPhotoScreenProps) {
  const selectedBgs = backgrounds.filter(bg => selectedBackgrounds.includes(bg.id));
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const totalPhotos = 1; // Always take only one photo regardless of numberOfPeople
  const allPhotosCaptured = capturedPhotos.length === totalPhotos;

  // Handle countdown
  useEffect(() => {
    if (countdown === null || countdown === 0) return;

    const timer = setTimeout(() => {
      const newCount = countdown - 1;
      setCountdown(newCount);

      if (newCount === 0) {
        capturePhoto();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const startCountdown = () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setCountdown(3);
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // Set canvas dimensions
    canvas.width = 1280;
    canvas.height = 720;

    // Create a vibrant green screen background
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#00ff00");
    gradient.addColorStop(0.5, "#00dd00");
    gradient.addColorStop(1, "#00bb00");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add "Green Screen Photo" text in center
    context.fillStyle = "rgba(0, 0, 0, 0.3)";
    context.font = "bold 80px system-ui";
    context.textAlign = "center";
    context.fillText("GREEN SCREEN PHOTO", canvas.width / 2, canvas.height / 2 - 50);
    
    context.fillStyle = "rgba(0, 0, 0, 0.2)";
    context.font = "48px system-ui";
    context.fillText("Mock Photo for Demonstration", canvas.width / 2, canvas.height / 2 + 50);

    // Add order number watermark in top-right corner
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    const watermarkWidth = 280;
    const watermarkHeight = 100;
    const watermarkX = canvas.width - watermarkWidth - 30;
    const watermarkY = 30;
    context.fillRect(watermarkX, watermarkY, watermarkWidth, watermarkHeight);
    
    // Draw white border
    context.strokeStyle = "white";
    context.lineWidth = 4;
    context.strokeRect(watermarkX, watermarkY, watermarkWidth, watermarkHeight);
    
    // Add order number text
    context.fillStyle = "rgba(255, 255, 255, 0.9)";
    context.font = "24px system-ui";
    context.textAlign = "center";
    context.fillText("Order #", watermarkX + watermarkWidth / 2, watermarkY + 35);
    
    context.fillStyle = "white";
    context.font = "bold 40px system-ui";
    context.fillText(orderNumber, watermarkX + watermarkWidth / 2, watermarkY + 75);

    // Convert to image data
    const photoData = canvas.toDataURL("image/jpeg", 0.9);

    // Add to captured photos
    const newPhotos = [...capturedPhotos, photoData];
    setCapturedPhotos(newPhotos);

    // Reset for next photo
    setCountdown(null);
    setIsCapturing(false);
    setCurrentPhotoIndex(currentPhotoIndex + 1);
  };

  const retakePhoto = (index: number) => {
    const newPhotos = [...capturedPhotos];
    newPhotos.splice(index, 1);
    setCapturedPhotos(newPhotos);
    setCurrentPhotoIndex(index);
  };

  const retakeAll = () => {
    setCapturedPhotos([]);
    setCurrentPhotoIndex(0);
    setCountdown(null);
    setIsCapturing(false);
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
    <div className="min-h-screen w-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-8">
      {/* Hidden Admin Button */}
      <Button
        onClick={handleGearClick}
        variant="ghost"
        size="sm"
        className="fixed top-24 right-4 opacity-0 hover:opacity-0 active:scale-95 transition-all select-none z-50 w-20 h-20"
      >
        <Settings className="w-10 h-10" />
      </Button>
      <div className="max-w-7xl w-full">
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl text-slate-900">Quick Selfie</h2>
            <Button
              onClick={onBack}
              size="lg"
              className="h-14 px-8 text-lg active:scale-95 transition-all select-none bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg border-0"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back
            </Button>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <div className="p-5 bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-400 rounded-xl shadow-md">
              <p className="text-xl text-blue-900">
                <Camera className="inline w-6 h-6 mr-2 mb-1" />
                <strong>Instructions:</strong> This photo is only used to match your face to the final picture. It will not be used as your actual green screen photo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mock Photo Preview */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Progress indicator */}
                <div className="bg-slate-100 rounded-lg p-4 border border-slate-300">
                  <p className="text-center text-slate-900">
                    {allPhotosCaptured 
                      ? `All Photos Captured: ${capturedPhotos.length} of ${totalPhotos}` 
                      : `Ready for Photo ${capturedPhotos.length + 1} of ${totalPhotos}`
                    }
                  </p>
                  <div className="flex gap-2 mt-3 justify-center">
                    {Array.from({ length: totalPhotos }).map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-3 w-12 rounded-full ${
                          idx < capturedPhotos.length
                            ? "bg-green-500"
                            : idx === capturedPhotos.length
                            ? "bg-blue-500"
                            : "bg-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Mock Photo Preview */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-green-400 via-green-500 to-green-600">
                  {/* Preview content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-black/30 text-center">
                      <Camera className="w-32 h-32 mx-auto mb-4" />
                      <p className="text-4xl">Mock Green Screen Photo</p>
                      <p className="text-2xl mt-2">Your photo will appear here</p>
                    </div>
                  </div>

                  {/* Order Number Watermark Preview */}
                  <div className="absolute top-4 right-4 bg-black/80 text-white px-8 py-4 rounded-lg border-4 border-white shadow-2xl">
                    <p className="text-base opacity-90 mb-1">Order #</p>
                    <p className="text-3xl tracking-wider">{orderNumber}</p>
                  </div>

                  {/* Countdown Overlay */}
                  {countdown !== null && countdown > 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-9xl font-bold animate-pulse">
                        {countdown}
                      </div>
                    </div>
                  )}

                  {/* Camera flash effect */}
                  {countdown === 0 && (
                    <div className="absolute inset-0 bg-white animate-ping" />
                  )}
                </div>

                {/* Camera Controls */}
                {!allPhotosCaptured && (
                  <div className="flex gap-4">
                    <Button
                      onClick={startCountdown}
                      disabled={isCapturing}
                      size="lg"
                      className="flex-1 h-16 text-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 disabled:opacity-50 transition-all select-none"
                    >
                      <Camera className="mr-2" />
                      {isCapturing ? "Capturing..." : "Capture Mock Photo"}
                    </Button>
                  </div>
                )}

                {allPhotosCaptured && (
                  <div className="flex gap-4">
                    <Button
                      onClick={retakeAll}
                      variant="outline"
                      size="lg"
                      className="flex-1 h-16 text-lg active:scale-95 transition-transform select-none border-3 border-orange-600 bg-orange-100 text-orange-800 hover:bg-orange-200 hover:border-orange-700 shadow-md font-semibold"
                    >
                      <RotateCcw className="mr-2" />
                      Retake All
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Captured Photos Sidebar */}
            <div className="bg-slate-100 rounded-xl p-6 border border-slate-300">
              <h3 className="text-2xl text-slate-900 mb-4">Captured Photos</h3>

              {capturedPhotos.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No photos yet</p>
                  <p className="text-sm mt-1">Click "Capture Mock Photo" to begin</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {capturedPhotos.map((photo, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={photo}
                        alt={`Captured photo ${idx + 1}`}
                        className="w-full rounded-lg border-2 border-slate-300"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                        Photo {idx + 1}
                      </div>
                      <Button
                        onClick={() => retakePhoto(idx)}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95 select-none"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Retake
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex gap-4 mt-8">
            <Button
              onClick={() => setShowCancelDialog(true)}
              variant="destructive"
              size="lg"
              className="h-16 text-lg flex-1 active:scale-95 transition-transform select-none"
            >
              <X className="mr-2" />
              Cancel
            </Button>
            {!allPhotosCaptured && (
              <Button
                onClick={onNext}
                variant="outline"
                size="lg"
                className="h-16 text-lg flex-1 active:scale-95 transition-transform select-none border-2 border-slate-400 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:border-slate-500"
              >
                Skip Photo
                <ArrowRight className="ml-2" />
              </Button>
            )}
            <Button
              onClick={onNext}
              disabled={!allPhotosCaptured}
              size="lg"
              className="h-16 text-lg flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 active:scale-95 disabled:opacity-50 transition-all select-none"
            >
              Next
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

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
