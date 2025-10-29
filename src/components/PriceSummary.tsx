import { Card } from "./ui/card";

interface PriceSummaryProps {
  basePrice: string;
  numberOfPhotos: string;
  deliveryMethod: string[];
  selectedBackgrounds: (number | string)[];
  isFreeDay: boolean;
  compact?: boolean;
}

// Background data for checking standard backgrounds
const standardBackgroundIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function calculatePricing(
  basePrice: string,
  numberOfPhotos: string,
  deliveryMethod: string[],
  selectedBackgrounds: (number | string)[],
  isFreeDay: boolean
) {
  const price = parseFloat(basePrice) || 0;
  const photos = parseInt(numberOfPhotos) || 1;
  const printCost = deliveryMethod.includes("prints") ? photos * 2 : 0;
  
  // Separate standard, extra, and uploaded custom backgrounds
  const standardBackgrounds = selectedBackgrounds.filter(id => 
    typeof id === 'number' && standardBackgroundIds.includes(id)
  );
  
  // Extra backgrounds: string IDs that start with "custom-" but NOT "uploaded-custom-" (FREE)
  const extraBackgroundIds = selectedBackgrounds.filter(id => 
    typeof id === 'string' && 
    String(id).startsWith('custom-') && 
    !String(id).startsWith('uploaded-custom-')
  );
  
  // Uploaded custom backgrounds: string IDs that start with "uploaded-custom-" ($5.00 each)
  const uploadedCustomBackgroundIds = selectedBackgrounds.filter(id => 
    typeof id === 'string' && 
    String(id).startsWith('uploaded-custom-')
  );
  
  // Calculate cost for uploaded custom backgrounds ($5.00 each)
  const uploadedCustomBackgroundCost = uploadedCustomBackgroundIds.length * 5;
  
  // Calculate additional background cost: First background is free, each additional is $2.50
  // Count total non-extra backgrounds (standard + uploaded custom)
  const totalChargableBackgrounds = standardBackgrounds.length + uploadedCustomBackgroundIds.length;
  const additionalBackgroundCount = Math.max(0, totalChargableBackgrounds - 1);
  const additionalBackgroundCost = additionalBackgroundCount * 2.5;
  
  // If it's a free day, override all pricing to 0
  const totalPrice = isFreeDay ? 0 : price + printCost + uploadedCustomBackgroundCost + additionalBackgroundCost;
  
  return {
    price,
    photos,
    printCost,
    standardBackgrounds: standardBackgrounds.length,
    extraBackgrounds: extraBackgroundIds.length,
    uploadedCustomBackgrounds: uploadedCustomBackgroundIds.length,
    uploadedCustomBackgroundCost,
    additionalBackgroundCount,
    additionalBackgroundCost,
    totalPrice,
    isFreeDay
  };
}

export function PriceSummary({ 
  basePrice, 
  numberOfPhotos, 
  deliveryMethod, 
  selectedBackgrounds, 
  isFreeDay,
  compact = false 
}: PriceSummaryProps) {
  const pricing = calculatePricing(
    basePrice,
    numberOfPhotos,
    deliveryMethod,
    selectedBackgrounds,
    isFreeDay
  );

  if (compact) {
    return (
      <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-600">Current Total</p>
            {pricing.isFreeDay && (
              <p className="text-xs text-green-600 mt-0.5">🎉 Free Day Active</p>
            )}
          </div>
          <p className={`${pricing.isFreeDay ? 'text-3xl' : 'text-2xl'} text-green-700`}>
            {pricing.isFreeDay && <span className="line-through text-xl text-slate-400 mr-2">${pricing.price.toFixed(2)}</span>}
            ${pricing.totalPrice.toFixed(2)}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
      <h3 className="mb-4 text-green-800">Price Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-slate-700">
          <span>Base Price:</span>
          <span>${pricing.price.toFixed(2)}</span>
        </div>
        
        {pricing.printCost > 0 && (
          <div className="flex justify-between text-slate-700">
            <span>Print Cost ({pricing.photos} prints):</span>
            <span>${pricing.printCost.toFixed(2)}</span>
          </div>
        )}
        
        {pricing.additionalBackgroundCount > 0 && (
          <div className="flex justify-between text-slate-700">
            <span>Additional Backgrounds ({pricing.additionalBackgroundCount}):</span>
            <span>${pricing.additionalBackgroundCost.toFixed(2)}</span>
          </div>
        )}
        
        {pricing.extraBackgrounds > 0 && (
          <div className="flex justify-between text-slate-700">
            <span>Extra Backgrounds ({pricing.extraBackgrounds}):</span>
            <span className="text-green-600">FREE</span>
          </div>
        )}
        
        {pricing.uploadedCustomBackgrounds > 0 && (
          <div className="flex justify-between text-slate-700">
            <span>Custom Backgrounds ({pricing.uploadedCustomBackgrounds}):</span>
            <span>${pricing.uploadedCustomBackgroundCost.toFixed(2)}</span>
          </div>
        )}
        
        <div className="border-t border-green-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-green-800">Total:</span>
            <span className="text-2xl text-green-700">
              {pricing.isFreeDay && (
                <span className="line-through text-lg text-slate-400 mr-2">
                  ${(pricing.price + pricing.printCost + pricing.uploadedCustomBackgroundCost + pricing.additionalBackgroundCost).toFixed(2)}
                </span>
              )}
              ${pricing.totalPrice.toFixed(2)}
            </span>
          </div>
          {pricing.isFreeDay && (
            <p className="text-sm text-green-600 text-right mt-1">🎉 Free Day Active</p>
          )}
        </div>
      </div>
    </Card>
  );
}
