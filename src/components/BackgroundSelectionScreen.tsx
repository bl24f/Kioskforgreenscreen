import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight, Check, X, Sparkles, Upload, Settings } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CancelConfirmationDialog } from "./CancelConfirmationDialog";
import { ExtraBackgroundsDialog } from "./ExtraBackgroundsDialog";
import { UploadCustomBackgroundDialog } from "./UploadCustomBackgroundDialog";
import { AdminDialog } from "./AdminDialog";
import { AdminPasswordDialog } from "./AdminPasswordDialog";
import { PriceSummary } from "./PriceSummary";

interface Background {
  id: number | string;
  name: string;
  url: string;
}

interface BackgroundSelectionScreenProps {
  selectedBackgrounds: (number | string)[];
  setSelectedBackgrounds: (ids: (number | string)[]) => void;
  enabledBackgrounds: number[];
  enableCustomBackgrounds: boolean;
  onNext: () => void;
  onBack: () => void;
  onCancel: () => void;
  numberOfPhotos: number;
  deliveryMethod?: string[];
  onBackgroundNamesChange?: (names: { [key: string]: string }) => void;
  onBackgroundImagesChange?: (images: { [key: string]: string }) => void;
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
  maxDigitalBackgrounds?: number;
  setMaxDigitalBackgrounds?: (value: number) => void;
  setEnabledBackgrounds?: (value: number[]) => void;
  setEnableCustomBackgrounds?: (value: boolean) => void;
  isFreeDay?: boolean;
  setIsFreeDay?: (value: boolean) => void;
  showFreeDayOption?: boolean;
  setShowFreeDayOption?: (value: boolean) => void;
}

const backgrounds: Background[] = [
  { id: 1, name: "Tropical Beach", url: "https://images.unsplash.com/photo-1702743599501-a821d0b38b66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzYxMDM1NTM2fDA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 2, name: "Eiffel Tower", url: "https://images.unsplash.com/photo-1570097703229-b195d6dd291f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzfGVufDF8fHx8MTc2MTAzOTA1MHww&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 3, name: "New York City", url: "https://images.unsplash.com/photo-1708438922084-2684e5401066?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwY2l0eXNjYXBlfGVufDF8fHx8MTc2MDk4NzIwMnww&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 4, name: "Mountain Sunset", url: "https://images.unsplash.com/photo-1643559247329-7254c71646f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMHN1bnNldHxlbnwxfHx8fDE3NjA5NjU2MjV8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 5, name: "Space Galaxy", url: "https://images.unsplash.com/photo-1585575141647-c2c436949374?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGFjZSUyMGdhbGF4eSUyMHN0YXJzfGVufDF8fHx8MTc2MTAzOTI5M3ww&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 6, name: "Cherry Blossoms", url: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVycnklMjBibG9zc29tcyUyMGphcGFufGVufDF8fHx8MTc2MDk1NjIwNnww&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 7, name: "Northern Lights", url: "https://images.unsplash.com/photo-1644659513503-abcbf75b4521?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3J0aGVybiUyMGxpZ2h0cyUyMGF1cm9yYXxlbnwxfHx8fDE3NjEwNzIzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 8, name: "Desert Dunes", url: "https://images.unsplash.com/photo-1650511503497-f09930f2e10a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBzdW5zZXQlMjBkdW5lc3xlbnwxfHx8fDE3NjEwNzIzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 9, name: "Underwater Ocean", url: "https://images.unsplash.com/photo-1744656317897-c97c8f3b1371?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bmRlcndhdGVyJTIwb2NlYW4lMjBjb3JhbHxlbnwxfHx8fDE3NjA5ODg4ODl8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 10, name: "Autumn Forest", url: "https://images.unsplash.com/photo-1618995293724-af5119646c58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBmb3Jlc3QlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NjEwNzIzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 11, name: "Grand Canyon", url: "https://images.unsplash.com/photo-1706387631343-79e1a2ec3fdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFuZCUyMGNhbnlvbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NjEwNzIzNzR8MA&ixlib=rb-4.1.0&q=80&w=1080" },
  { id: 12, name: "London Bridge", url: "https://images.unsplash.com/photo-1674073091371-ee190d32cae7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25kb24lMjBicmlkZ2UlMjBlbmdsYW5kfGVufDF8fHx8MTc2MTA3MjM3NHww&ixlib=rb-4.1.0&q=80&w=1080" },
];

export function BackgroundSelectionScreen({
  selectedBackgrounds,
  setSelectedBackgrounds,
  enabledBackgrounds,
  enableCustomBackgrounds,
  onNext,
  onBack,
  onCancel,
  numberOfPhotos,
  deliveryMethod = [],
  onBackgroundNamesChange,
  onBackgroundImagesChange,
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
  maxDigitalBackgrounds = 1,
  setMaxDigitalBackgrounds,
  setEnabledBackgrounds,
  setEnableCustomBackgrounds,
  isFreeDay = false,
  setIsFreeDay,
  showFreeDayOption = false,
  setShowFreeDayOption,
}: BackgroundSelectionScreenProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showExtraDialog, setShowExtraDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [extraBackgrounds, setExtraBackgrounds] = useState<Background[]>([]);
  const [uploadedBackgrounds, setUploadedBackgrounds] = useState<Background[]>([]);
  const [uploadCounter, setUploadCounter] = useState(0);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Combine standard, extra, and uploaded custom backgrounds (memoized to prevent infinite loops)
  const allBackgrounds = useMemo(() => [
    ...backgrounds, 
    ...extraBackgrounds, 
    ...uploadedBackgrounds
  ], [extraBackgrounds, uploadedBackgrounds]);
  
  // Create background names map (memoized)
  const backgroundNamesMap = useMemo(() => {
    const namesMap: { [key: string]: string } = {};
    allBackgrounds.forEach(bg => {
      namesMap[String(bg.id)] = bg.name;
    });
    return namesMap;
  }, [allBackgrounds]);
  
  // Create background images map (memoized)
  const backgroundImagesMap = useMemo(() => {
    const imagesMap: { [key: string]: string } = {};
    allBackgrounds.forEach(bg => {
      imagesMap[String(bg.id)] = bg.url;
    });
    return imagesMap;
  }, [allBackgrounds]);
  
  // Update background names map whenever it changes
  useEffect(() => {
    if (onBackgroundNamesChange) {
      onBackgroundNamesChange(backgroundNamesMap);
    }
  }, [backgroundNamesMap, onBackgroundNamesChange]);
  
  // Update background images map whenever it changes
  useEffect(() => {
    if (onBackgroundImagesChange) {
      onBackgroundImagesChange(backgroundImagesMap);
    }
  }, [backgroundImagesMap, onBackgroundImagesChange]);
  
  // Filter backgrounds to only show enabled ones (for standard backgrounds)
  const availableBackgrounds = backgrounds.filter(bg => enabledBackgrounds.includes(bg.id as number));

  const toggleBackground = (id: number | string) => {
    if (selectedBackgrounds.includes(id)) {
      setSelectedBackgrounds(selectedBackgrounds.filter(bgId => bgId !== id));
    } else {
      // Check total count - maximum 5 backgrounds total (including extra backgrounds)
      if (selectedBackgrounds.length >= maxDigitalBackgrounds) {
        return;
      }
      
      // Check if this is an uploaded custom background (string ID starting with "uploaded-custom-")
      const isUploadedCustomBackground = typeof id === 'string' && String(id).startsWith('uploaded-custom-');
      
      if (isUploadedCustomBackground) {
        // Remove any previously selected uploaded custom backgrounds
        const nonUploadedCustomBackgrounds = selectedBackgrounds.filter(bgId => 
          typeof bgId === 'number' || !String(bgId).startsWith('uploaded-custom-')
        );
        
        // Add the new uploaded custom background (auto-deselecting any previous uploaded custom background)
        setSelectedBackgrounds([...nonUploadedCustomBackgrounds, id]);
      } else {
        // Regular or extra background - just add it
        setSelectedBackgrounds([...selectedBackgrounds, id]);
      }
    }
  };

  const handleSelectExtraBackground = (bg: { id: string; name: string; url: string }) => {
    // Check if this extra background is already added
    if (!extraBackgrounds.find(cb => cb.id === bg.id)) {
      setExtraBackgrounds([...extraBackgrounds, bg]);
    }
    
    // Toggle selection like a regular background
    toggleBackground(bg.id);
  };

  const handleUploadComplete = (imageData: string) => {
    // Generate unique ID for this upload
    const newCounter = uploadCounter + 1;
    setUploadCounter(newCounter);
    
    const uploadedBg: Background = {
      id: `uploaded-custom-${newCounter}`,
      name: `Custom Upload ${newCounter}`,
      url: imageData,
    };
    
    // Add to the array of uploaded backgrounds
    setUploadedBackgrounds([...uploadedBackgrounds, uploadedBg]);
    
    // Auto-select the uploaded background if under the limit
    // Remove any previously selected uploaded custom backgrounds
    const nonUploadedCustomBackgrounds = selectedBackgrounds.filter(bgId => 
      typeof bgId === 'number' || !String(bgId).startsWith('uploaded-custom-')
    );
    
    // Only auto-select if we're under the total limit of 5 backgrounds
    if (nonUploadedCustomBackgrounds.length < maxDigitalBackgrounds) {
      setSelectedBackgrounds([...nonUploadedCustomBackgrounds, uploadedBg.id]);
    } else {
      // Just add to available backgrounds, don't auto-select
      setSelectedBackgrounds(nonUploadedCustomBackgrounds);
    }
  };

  const selectedBgs = allBackgrounds.filter(bg => selectedBackgrounds.includes(bg.id));

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
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center p-8">
      {/* Hidden Admin Button */}
      <Button
        onClick={handleGearClick}
        variant="ghost"
        size="sm"
        className="fixed top-24 right-4 opacity-0 hover:opacity-0 active:scale-95 transition-all select-none z-50 w-40 h-40"
      >
        <Settings className="w-20 h-20" />
      </Button>
      
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Selection */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-2xl space-y-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl text-slate-900">Choose Your Backgrounds</h2>
            <Button
              onClick={onBack}
              size="lg"
              className="h-14 px-8 text-lg active:scale-95 transition-all select-none bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg border-0"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back
            </Button>
          </div>

          <div className="mb-4 space-y-2">
            <p className="text-lg text-slate-700">
              Select your backgrounds
              {selectedBackgrounds.length > 0 && (
                <span className="ml-2 text-green-600">
                  ({selectedBackgrounds.length} selected)
                </span>
              )}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Pricing:</span> First background is included. Each additional background is <span className="font-semibold">$2.50</span>.
              </p>
            </div>
            {selectedBackgrounds.length >= maxDigitalBackgrounds && (
              <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-2">
                Maximum of {maxDigitalBackgrounds} backgrounds reached.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {/* Extra Backgrounds Button - Always visible */}
            <button
              onClick={() => setShowExtraDialog(true)}
              className="relative aspect-square rounded-xl overflow-hidden border-4 border-dashed border-purple-500 bg-gradient-to-br from-purple-200/50 to-pink-200/50 hover:from-purple-300/50 hover:to-pink-300/50 transition-all active:scale-95 select-none shadow-lg shadow-purple-500/20"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="text-purple-900 text-center px-2">
                  <p className="text-lg">Extra</p>
                  <p className="text-sm text-purple-700">Backgrounds</p>
                </div>
              </div>
            </button>

            {/* Upload Custom Background Button - Only show if enabled */}
            {enableCustomBackgrounds && (
              <button
                onClick={() => setShowUploadDialog(true)}
                className="relative aspect-square rounded-xl overflow-hidden border-4 border-dashed border-blue-500 bg-gradient-to-br from-blue-200/50 to-cyan-200/50 hover:from-blue-300/50 hover:to-cyan-300/50 transition-all active:scale-95 select-none shadow-lg shadow-blue-500/20"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-3">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-blue-900 text-center px-2">
                    <p className="text-lg">Custom</p>
                    <p className="text-sm text-blue-700">Background</p>
                    <p className="text-xs text-blue-600">(+$5.00)</p>
                  </div>
                </div>
              </button>
            )}

            {/* Standard Backgrounds */}
            {availableBackgrounds.map((bg) => {
              const isSelected = selectedBackgrounds.includes(bg.id);
              const selectionOrder = selectedBackgrounds.indexOf(bg.id) + 1;
              
              return (
                <button
                  key={bg.id}
                  onClick={() => toggleBackground(bg.id)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all active:scale-95 select-none ${
                    isSelected
                      ? "border-green-500 shadow-lg"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <ImageWithFallback
                    src={bg.url}
                    alt={bg.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <div className="bg-green-500 rounded-full p-2">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                        <span className="text-sm">{selectionOrder}</span>
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-center text-sm">
                    {bg.name}
                  </div>
                </button>
              );
            })}

            {/* Extra Backgrounds */}
            {extraBackgrounds.map((bg) => {
              const isSelected = selectedBackgrounds.includes(bg.id);
              const selectionOrder = selectedBackgrounds.indexOf(bg.id) + 1;
              
              return (
                <button
                  key={bg.id}
                  onClick={() => toggleBackground(bg.id)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all active:scale-95 select-none ${
                    isSelected
                      ? "border-green-500 shadow-lg"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <ImageWithFallback
                    src={bg.url}
                    alt={bg.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <div className="bg-green-500 rounded-full p-2">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                        <span className="text-sm">{selectionOrder}</span>
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-center text-sm">
                    {bg.name}
                  </div>
                  <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Extra
                  </div>
                </button>
              );
            })}

            {/* Uploaded Backgrounds */}
            {uploadedBackgrounds.map((bg) => {
              const isSelected = selectedBackgrounds.includes(bg.id);
              const selectionOrder = selectedBackgrounds.indexOf(bg.id) + 1;
              
              return (
                <button
                  key={bg.id}
                  onClick={() => toggleBackground(bg.id)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all active:scale-95 select-none ${
                    isSelected
                      ? "border-green-500 shadow-lg"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={bg.url}
                    alt={bg.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <>
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <div className="bg-green-500 rounded-full p-2">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                        <span className="text-sm">{selectionOrder}</span>
                      </div>
                    </>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-center text-sm">
                    {bg.name}
                  </div>
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    Custom
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
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
              disabled={selectedBackgrounds.length === 0}
              size="lg"
              className="h-16 text-lg flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all select-none"
            >
              Next
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>

        {/* Preview and Price Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-200 space-y-6">
          <div>
            <h3 className="text-2xl text-slate-900 mb-6">Selected Backgrounds</h3>
            {selectedBgs.length === 0 ? (
              <div className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                <div className="text-center">
                  <p className="text-xl mb-2">No backgrounds selected</p>
                  <p className="text-sm">Click on thumbnails to select</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {selectedBgs.map((bg, index) => (
                  <div key={bg.id} className="relative">
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-slate-300">
                      <ImageWithFallback
                        src={bg.url}
                        alt={bg.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full shadow-lg">
                      <span className="text-sm">Photo {index + 1}</span>
                    </div>
                    <div className="mt-2 text-center">
                      <h4 className="text-lg text-slate-900">{bg.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <PriceSummary
            basePrice={basePrice}
            numberOfPhotos={String(numberOfPhotos)}
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

      <ExtraBackgroundsDialog
        open={showExtraDialog}
        onOpenChange={setShowExtraDialog}
        onSelectBackground={handleSelectExtraBackground}
        selectedBackgroundIds={selectedBackgrounds.filter(id => typeof id === 'string') as string[]}
      />

      <UploadCustomBackgroundDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onUploadComplete={handleUploadComplete}
      />
      
      <AdminPasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        onPasswordCorrect={handlePasswordCorrect}
      />
      
      {setBasePrice && setTheme && setAvailablePaymentMethods && setAvailableDeliveryMethods && 
       setMaxNumberOfPhotos && setMaxNumberOfEmails && setMaxNumberOfPrints && setMaxDigitalBackgrounds &&
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
      )}
    </div>
  );
}