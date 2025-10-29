import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { CheckCircle2, Loader2, Printer } from "lucide-react";
import { Logo } from "./Logo";
import { PriceSummary } from "./PriceSummary";
import { getNextOrderNumber } from "./OrderNumberManager";

interface FinalReceiptScreenProps {
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
  customerNumber: string;
  orderNumber: string;
  capturedPhotos: string[];
  onComplete: () => void;
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

export function FinalReceiptScreen({
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
  customerNumber,
  orderNumber: propsOrderNumber,
  capturedPhotos,
  onComplete,
}: FinalReceiptScreenProps) {
  const [isProcessing, setIsProcessing] = useState(true);
  // Use the order number passed from props
  const orderNumber = propsOrderNumber;

  useEffect(() => {
    // No need to generate order number anymore, it's passed from props

    const timer = setTimeout(() => {
      setIsProcessing(false);
      
      // Save order to localStorage for order history
      saveOrderToHistory(orderNumber);
    }, 3000);

    return () => clearTimeout(timer);
  }, [customerNumber, orderNumber]);

  const saveOrderToHistory = (orderNum: string) => {
    if (!orderNum) return;
    
    try {
      const existingOrders = localStorage.getItem('orderHistory');
      let orders = [];
      
      if (existingOrders) {
        try {
          const parsed = JSON.parse(existingOrders);
          orders = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.warn('Invalid order history data, resetting');
          orders = [];
        }
      }
      
      // Calculate pricing with safety checks
      const price = parseFloat(basePrice) || 0;
      const photos = parseInt(numberOfPhotos) || 1;
      const safeDeliveryMethod = Array.isArray(deliveryMethod) ? deliveryMethod : [];
      const printCost = safeDeliveryMethod.includes("prints") ? photos * 2 : 0;
      
      const safeSelectedBackgrounds = Array.isArray(selectedBackgrounds) ? selectedBackgrounds : [];
      const standardBackgrounds = backgrounds.filter(bg => safeSelectedBackgrounds.includes(bg.id));
      const uploadedCustomBackgroundIds = safeSelectedBackgrounds.filter(id => 
        typeof id === 'string' && String(id).startsWith('uploaded-custom-')
      );
      const uploadedCustomBackgroundCost = uploadedCustomBackgroundIds.length * 5;
      const totalChargableBackgrounds = standardBackgrounds.length + uploadedCustomBackgroundIds.length;
      const additionalBackgroundCount = Math.max(0, totalChargableBackgrounds - 1);
      const additionalBackgroundCost = additionalBackgroundCount * 2.5;
      const totalPrice = isFreeDay ? 0 : price + printCost + uploadedCustomBackgroundCost + additionalBackgroundCost;
      
      const safeEmails = Array.isArray(emails) ? emails : [];
      const actualEmails = safeEmails.filter(email => email && email.trim() !== '');
      const safeCapturedPhotos = Array.isArray(capturedPhotos) ? capturedPhotos : [];
      
      const newOrder = {
        orderNumber: orderNum,
        customerNumber: customerNumber || 'N/A',
        timestamp: Date.now(),
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        userName: userName || 'Unknown',
        emails: actualEmails,
        numberOfPeople: numberOfPeople || '1',
        selectedBackgrounds: safeSelectedBackgrounds,
        deliveryMethod: safeDeliveryMethod,
        numberOfPhotos: numberOfPhotos || '1',
        paymentType: paymentType || 'cash',
        basePrice: basePrice || '0.00',
        theme: theme || '',
        isFreeDay: isFreeDay || false,
        totalPrice: totalPrice.toFixed(2),
        capturedPhotos: safeCapturedPhotos,
        pickupComplete: false,
        emailSent: false,
        picturesPrinted: false,
        pictureTaken: false,
      };
      
      // Add new order to beginning of array
      orders.unshift(newOrder);
      
      // Keep only last 500 orders to prevent excessive localStorage usage
      // IMPORTANT: Order history is NEVER deleted except when exceeding 500 orders
      // It persists across page reloads, URL changes, and browser sessions
      if (orders.length > 500) {
        orders.splice(500);
      }
      
      localStorage.setItem('orderHistory', JSON.stringify(orders));
    } catch (error) {
      console.error('Failed to save order to history:', error);
    }
  };

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
  
  // Filter out empty emails to get actual count
  const actualEmails = emails.filter(email => email.trim() !== '');
  const emailCount = actualEmails.length;
  
  // If it's a free day, override all pricing to 0
  const totalPrice = isFreeDay ? 0 : price + printCost + uploadedCustomBackgroundCost + additionalBackgroundCost;
  
  const totalBackgroundsCount = standardBackgrounds.length + selectedExtraBackgrounds.length + selectedUploadedCustomBackgrounds.length;
  
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    window.print();
  };

  if (isProcessing) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-12 shadow-2xl text-center border border-slate-200">
          <Loader2 className="w-20 h-20 text-green-600 animate-spin mx-auto mb-6" />
          <h2 className="text-3xl text-slate-900 mb-2">Processing Your Order...</h2>
          <p className="text-lg text-slate-700">Please wait while we finalize your green screen photos</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          @page {
            margin: 0.15in;
            size: auto;
          }
          body * {
            visibility: hidden;
          }
          .printable-receipt, .printable-receipt * {
            visibility: visible;
          }
          .printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .customer-copy {
            display: none !important;
          }
          .printed-copy, .cameraman-section {
            display: block !important;
          }
          .receipt-copy {
            margin: 0;
            padding: 0.1in;
          }
          .cut-line {
            text-align: center;
            padding: 0.03in 0;
            border-top: 1px dashed #666;
            border-bottom: 1px dashed #666;
            margin: 0.02in 0;
          }
        }
      `}</style>

      <div className="min-h-screen w-screen bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-start justify-center pt-4 pb-4 px-4 overflow-auto">
        <div className="max-w-3xl w-full bg-white rounded-2xl p-3 shadow-2xl">
          {/* Success Header (No Print) */}
          <div className="text-center mb-2 no-print">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <h2 className="text-2xl text-gray-900 mb-0.5">Order Complete!</h2>
            <p className="text-gray-600">Order #{orderNumber} | Receipt ready to print</p>
          </div>

          {/* Printable Receipt */}
          <div className="printable-receipt space-y-0.5">
            {/* CUSTOMER COPY - No stamps, merged disclaimers */}
            <div className="border-3 border-gray-800 p-2 receipt-copy customer-copy">
              <div className="text-center mb-0.5 pb-0.5 border-b-2 border-dashed border-gray-400">
                <Logo size="sm" showText={true} />
                <div className="mt-0">
                  <p className="text-sm">CUSTOMER COPY</p>
                  <p className="text-[10px] text-gray-600">Please retain for your records</p>
                </div>
              </div>

              {/* Customer Details & Order Number Combined */}
              <div className="grid grid-cols-3 gap-1 mb-1 text-[10px]">
                <div>
                  <p className="text-gray-600">Customer:</p>
                  <p>{userName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Event:</p>
                  <p>{theme || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Payment:</p>
                  <p className="capitalize">
                    {!paymentType ? "N/A" : (() => {
                      switch (paymentType) {
                        case "debit":
                          return "Debit Card";
                        case "credit":
                          return "Credit Card";
                        default:
                          return paymentType.charAt(0).toUpperCase() + paymentType.slice(1);
                      }
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Date:</p>
                  <p>{currentDate}</p>
                </div>
                <div>
                  <p className="text-gray-600">Time:</p>
                  <p>{currentTime}</p>
                </div>
              </div>

              <Separator className="my-0.5" />

              {/* Order Number */}
              <div className="text-center border-3 border-gray-800 p-1.5 mb-1 bg-gray-100">
                <p className="text-[10px] mb-0.5">ORDER NUMBER</p>
                <p className="text-2xl tracking-wider font-bold">#{orderNumber}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{totalBackgroundsCount} photos included | Customer: {customerNumber}</p>
              </div>

              {/* Selected Backgrounds */}
              {standardBackgrounds.length > 0 && (
                <div className="mb-1">
                  <h3 className="text-xs mb-0.5">Standard Backgrounds:</h3>
                  <div className="border-2 border-gray-800 p-1 bg-gray-50 text-[10px]">
                    {standardBackgrounds.map((bg, index) => (
                      <div key={bg.id} className="py-0">
                        {index + 1}. {bg.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedExtraBackgrounds.length > 0 && (
                <div className="mb-1">
                  <h3 className="text-xs mb-0.5">Extra Backgrounds (FREE):</h3>
                  <div className="border-2 border-gray-800 p-1 bg-gray-50 text-[10px]">
                    {selectedExtraBackgrounds.map((bg, index) => (
                      <div key={bg.id} className="py-0">
                        {index + 1}. {bg.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedUploadedCustomBackgrounds.length > 0 && (
                <div className="mb-1">
                  <h3 className="text-xs mb-0.5">Custom Backgrounds:</h3>
                  <div className="border-2 border-gray-800 p-1 bg-gray-50 text-[10px]">
                    {selectedUploadedCustomBackgrounds.map((bg, index) => (
                      <div key={bg.id} className="py-0">
                        {index + 1}. {bg.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="flex justify-between text-[10px] mb-1 border-2 border-gray-800 p-1 bg-gray-50">
                <span><span className="text-gray-600">Prints:</span> {deliveryMethod.includes("prints") ? photos : "0"}</span>
                <span><span className="text-gray-600">Emails:</span> {emailCount}</span>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-2 border-gray-800 p-1 mb-1 bg-gray-50">
                <div className="text-[10px] space-y-0">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span>${price.toFixed(2)}</span>
                  </div>
                  {printCost > 0 && (
                    <div className="flex justify-between">
                      <span>Prints ({photos} x $2.00):</span>
                      <span>${printCost.toFixed(2)}</span>
                    </div>
                  )}
                  {additionalBackgroundCount > 0 && (
                    <div className="flex justify-between">
                      <span>Additional Backgrounds ({additionalBackgroundCount} x $2.50):</span>
                      <span>${additionalBackgroundCost.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedExtraBackgrounds.length > 0 && (
                    <div className="flex justify-between">
                      <span>Extra Backgrounds ({selectedExtraBackgrounds.length}):</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                  )}
                  {uploadedCustomBackgroundCost > 0 && (
                    <div className="flex justify-between">
                      <span>Custom Backgrounds ({uploadedCustomBackgroundIds.length} x $5.00):</span>
                      <span>${uploadedCustomBackgroundCost.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-0.5" />
                  <div className="flex justify-between pt-0.5">
                    <span>Total Amount:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Verification */}
              <div className="border-2 border-gray-800 p-1 mb-1">
                <p className="text-[10px] mb-0.5">PAYMENT VERIFIED:</p>
                <div className="border border-gray-400 h-6 bg-gray-50"></div>
              </div>

              {/* Merged Disclaimers Section - Customer Copy Only */}
              <div className="border-t-2 border-gray-300 pt-1 mt-1">
                {deliveryMethod.includes("prints") && (
                  <div className="bg-yellow-50 border-2 border-yellow-400 p-1 mb-1">
                    <p className="text-center text-[10px] mb-0.5">⚠️ PICKUP INSTRUCTIONS ⚠️</p>
                    <p className="text-center text-[10px]">Return at end of night to pick up prints. Show this receipt to attendant.</p>
                  </div>
                )}

                {deliveryMethod.includes("email") && emailCount > 0 && (
                  <div className="bg-blue-50 border-2 border-blue-400 p-1 mb-1">
                    <p className="text-center text-[10px] mb-0.5">���� EMAIL DELIVERY NOTICE 📧</p>
                    <p className="text-center text-[10px]">If you don't receive your email within 2 business days, contact us with your Order Number.</p>
                  </div>
                )}

                <p className="text-[10px] text-center">Questions? Call 1-800-GREEN-PIC or email support@greenscreenpictures.com</p>
                <p className="text-[10px] text-center text-gray-600 mt-0.5">Thank you for choosing Green Screen Pictures!</p>
              </div>
            </div>

            {/* PRINTED COPY - With stamps for physical printing */}
            <div className="border-3 border-gray-800 p-2 receipt-copy printed-copy hidden print:block">
              <div className="text-center mb-0.5 pb-0.5 border-b-2 border-dashed border-gray-400">
                <Logo size="sm" showText={true} />
                <div className="mt-0">
                  <p className="text-sm">OFFICIAL RECEIPT - PRINTED COPY</p>
                  <p className="text-[10px] text-gray-600">Present this copy for pickup</p>
                </div>
              </div>

              {/* Customer Details & Order Number Combined */}
              <div className="grid grid-cols-3 gap-1 mb-1 text-[10px]">
                <div>
                  <p className="text-gray-600">Customer:</p>
                  <p>{userName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Event:</p>
                  <p>{theme || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Payment:</p>
                  <p className="capitalize">
                    {!paymentType ? "N/A" : (() => {
                      switch (paymentType) {
                        case "debit":
                          return "Debit Card";
                        case "credit":
                          return "Credit Card";
                        default:
                          return paymentType.charAt(0).toUpperCase() + paymentType.slice(1);
                      }
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Date:</p>
                  <p>{currentDate}</p>
                </div>
                <div>
                  <p className="text-gray-600">Time:</p>
                  <p>{currentTime}</p>
                </div>
              </div>

              <Separator className="my-0.5" />

              {/* Order Number */}
              <div className="text-center border-3 border-gray-800 p-1.5 mb-1 bg-gray-100">
                <p className="text-[10px] mb-0.5">ORDER NUMBER</p>
                <p className="text-2xl tracking-wider font-bold">#{orderNumber}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{totalBackgroundsCount} photos included | Customer: {customerNumber}</p>
              </div>

              {/* Selected Backgrounds */}
              {standardBackgrounds.length > 0 && (
                <div className="mb-1">
                  <h3 className="text-xs mb-0.5">Standard Backgrounds:</h3>
                  <div className="border-2 border-gray-800 p-1 bg-gray-50 text-[10px]">
                    {standardBackgrounds.map((bg, index) => (
                      <div key={bg.id} className="py-0">
                        {index + 1}. {bg.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedExtraBackgrounds.length > 0 && (
                <div className="mb-1">
                  <h3 className="text-xs mb-0.5">Extra Backgrounds (FREE):</h3>
                  <div className="border-2 border-gray-800 p-1 bg-gray-50 text-[10px]">
                    {selectedExtraBackgrounds.map((bg, index) => (
                      <div key={bg.id} className="py-0">
                        {index + 1}. {bg.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedUploadedCustomBackgrounds.length > 0 && (
                <div className="mb-1">
                  <h3 className="text-xs mb-0.5">Custom Backgrounds:</h3>
                  <div className="border-2 border-gray-800 p-1 bg-gray-50 text-[10px]">
                    {selectedUploadedCustomBackgrounds.map((bg, index) => (
                      <div key={bg.id} className="py-0">
                        {index + 1}. {bg.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="flex justify-between text-[10px] mb-1 border-2 border-gray-800 p-1 bg-gray-50">
                <span><span className="text-gray-600">Prints:</span> {deliveryMethod.includes("prints") ? photos : "0"}</span>
                <span><span className="text-gray-600">Emails:</span> {emailCount}</span>
              </div>

              {/* Pricing Breakdown */}
              <div className="border-2 border-gray-800 p-1 mb-1 bg-gray-50">
                <div className="text-[10px] space-y-0">
                  <div className="flex justify-between">
                    <span>Base Price:</span>
                    <span>${price.toFixed(2)}</span>
                  </div>
                  {printCost > 0 && (
                    <div className="flex justify-between">
                      <span>Prints ({photos} x $2.00):</span>
                      <span>${printCost.toFixed(2)}</span>
                    </div>
                  )}
                  {additionalBackgroundCount > 0 && (
                    <div className="flex justify-between">
                      <span>Additional Backgrounds ({additionalBackgroundCount} x $2.50):</span>
                      <span>${additionalBackgroundCost.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedExtraBackgrounds.length > 0 && (
                    <div className="flex justify-between">
                      <span>Extra Backgrounds ({selectedExtraBackgrounds.length}):</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                  )}
                  {uploadedCustomBackgroundCost > 0 && (
                    <div className="flex justify-between">
                      <span>Custom Backgrounds ({uploadedCustomBackgroundIds.length} x $5.00):</span>
                      <span>${uploadedCustomBackgroundCost.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="my-0.5" />
                  <div className="flex justify-between pt-0.5">
                    <span>Total Amount:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Verification Stamps Grid */}
              <div className="grid grid-cols-2 gap-1 mb-1">
                {/* Payment Verification */}
                <div className="border-2 border-gray-800 p-1">
                  <p className="text-[10px] mb-0.5">PAYMENT VERIFIED:</p>
                  <div className="border border-gray-400 h-6 bg-gray-50"></div>
                </div>

                {/* Paid Stamp */}
                <div className="border-2 border-gray-800 p-1">
                  <p className="text-[10px] mb-0.5">PAID:</p>
                  <div className="border border-gray-400 h-6 bg-gray-50"></div>
                </div>
              </div>

              {/* Print Pickup Stamp for Printed Copy */}
              {deliveryMethod.includes("prints") && (
                <div className="grid grid-cols-2 gap-1 mb-1">
                  <div className="bg-yellow-50 border-2 border-yellow-400 p-1">
                    <p className="text-center text-[10px] mb-0.5">⚠️ PICKUP STAMP ⚠️</p>
                    <div className="border border-gray-400 h-6 bg-gray-50 mt-0.5 flex items-center justify-center">
                      <p className="text-[9px] text-gray-400">Prints Received Stamp</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border-2 border-green-600 p-1">
                    <p className="text-center text-[10px] mb-0.5">✓ PICTURES PICKED UP ✓</p>
                    <div className="border border-gray-400 h-6 bg-gray-50 mt-0.5 flex items-center justify-center">
                      <p className="text-[9px] text-gray-400">Pickup Confirmation</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Merged Disclaimers for Printed Copy */}
              <div className="border-t-2 border-gray-300 pt-1 mt-1">
                {deliveryMethod.includes("prints") && (
                  <p className="text-center text-[10px] mb-0.5">Return at end of night to pick up prints. Show this receipt to attendant.</p>
                )}

                {deliveryMethod.includes("email") && emailCount > 0 && (
                  <p className="text-center text-[10px] mb-0.5">If you don't receive your email within 2 business days, contact us with your Order Number.</p>
                )}

                <p className="text-[10px] text-center">Questions? Call 1-800-GREEN-PIC or email support@greenscreenpictures.com</p>
                <p className="text-[10px] text-center text-gray-600 mt-0.5">Thank you for choosing Green Screen Pictures!</p>
              </div>
            </div>

            {/* CUT LINE DIVIDER */}
            <div className="cut-line hidden print:block">
              <p className="text-xs">✂️ CUT HERE ✂️</p>
            </div>

            {/* CAMERAMAN COPY - Condensed, functional only, no stamps or disclaimers */}
            <div className="border-2 border-black p-1.5 receipt-copy hidden print:block cameraman-section">
              <div className="text-center mb-0.5 pb-0.5 border-b border-black">
                <p className="text-xs">CAMERAMAN COPY - INTERNAL</p>
              </div>

              {/* Order Number - Large and prominent */}
              <div className="text-center border-2 border-black p-1 mb-0.5 bg-gray-100">
                <p className="text-[8px]">ORDER #</p>
                <p className="text-lg tracking-wider font-bold">#{orderNumber}</p>
                <p className="text-[9px]">{totalBackgroundsCount} photos | {deliveryMethod.join(" & ")}</p>
              </div>

              {/* Customer Info with Quick Photo */}
              <div className="grid grid-cols-[1fr_auto] gap-2 mb-0.5">
                {/* Condensed Data Grid */}
                <div className="grid grid-cols-4 gap-x-1 gap-y-0 text-[9px] border border-black p-0.5 bg-gray-50">
                  <div>Name: {userName}</div>
                  <div>Event: {theme || "N/A"}</div>
                  <div>People: {numberOfPeople}</div>
                  <div>Payment: {paymentType ? (paymentType.charAt(0).toUpperCase() + paymentType.slice(1)) : "N/A"}</div>
                  <div className="col-span-2">Date: {currentDate}</div>
                  <div>Time: {currentTime}</div>
                  <div>Prints: {deliveryMethod.includes("prints") ? photos : "0"}</div>
                </div>

                {/* Quick Photo Thumbnail */}
                {capturedPhotos && capturedPhotos.length > 0 && capturedPhotos[0] && (
                  <div className="border border-black bg-white p-0.5 flex flex-col items-center justify-center">
                    <p className="text-[8px] mb-0.5 text-center">Quick Photo for ID</p>
                    <img 
                      src={capturedPhotos[0]} 
                      alt="Quick Photo" 
                      className="w-24 h-24 object-cover border border-gray-300"
                    />
                  </div>
                )}
              </div>

              {/* Backgrounds List - Compact */}
              {standardBackgrounds.length > 0 && (
                <div className="mb-0.5">
                  <p className="text-[9px] mb-0">Standard Backgrounds:</p>
                  <div className="border border-black p-0.5 bg-white text-[8px] leading-tight">
                    {standardBackgrounds.map((bg, index) => (
                      <div key={bg.id}>{index + 1}. {bg.name} (ID:{bg.id})</div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedExtraBackgrounds.length > 0 && (
                <div className="mb-0.5">
                  <p className="text-[9px] mb-0">Extra Backgrounds (FREE):</p>
                  <div className="border border-black p-0.5 bg-white text-[8px] leading-tight">
                    {selectedExtraBackgrounds.map((bg, index) => (
                      <div key={bg.id}>{index + 1}. {bg.name}</div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedUploadedCustomBackgrounds.length > 0 && (
                <div className="mb-0.5">
                  <p className="text-[9px] mb-0">Custom Backgrounds:</p>
                  <div className="border border-black p-0.5 bg-white text-[8px] leading-tight">
                    {selectedUploadedCustomBackgrounds.map((bg, index) => (
                      <div key={bg.id}>{index + 1}. {bg.name}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email Addresses - Redacted for privacy */}
              {emailCount > 0 && (
                <div className="mb-0.5">
                  <p className="text-[9px] mb-0">Emails ({emailCount}):</p>
                  <div className="border border-black p-0.5 bg-white text-[8px] leading-tight">
                    {actualEmails.map((email, index) => {
                      // Redact email - show only first 2 chars and domain
                      const [localPart, domain] = email.split('@');
                      const redacted = localPart.length > 2 
                        ? `${localPart.substring(0, 2)}***@${domain}` 
                        : `***@${domain}`;
                      return <div key={index}>{index + 1}. {redacted}</div>;
                    })}
                  </div>
                </div>
              )}

              {/* Pricing - Condensed */}
              <div className="border border-black p-0.5 mb-0.5 bg-gray-50 text-[9px]">
                <div className="flex justify-between">
                  <span>Base: ${price.toFixed(2)}</span>
                  {printCost > 0 && <span>Prints: ${printCost.toFixed(2)}</span>}
                  {uploadedCustomBackgroundCost > 0 && <span>Custom BG: ${uploadedCustomBackgroundCost.toFixed(2)}</span>}
                  <span>TOT: ${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Verification Stamps - CAMERAMAN COPY ONLY */}
              <div className="border-2 border-black p-0.5 mb-0.5 bg-gray-50">
                <div className="bg-gray-200 border border-black px-0.5 py-0.5 mb-0.5 -mx-0.5 -mt-0.5">
                  <p className="text-[9px]">Verification Stamps:</p>
                </div>
                <div className="space-y-0.5">
                  {/* First Row */}
                  <div className="grid grid-cols-3 gap-0.5">
                    <div className="border-2 border-black bg-white h-12 flex items-center justify-center">
                      <p className="text-[8px] text-center font-semibold">Emails Sent</p>
                    </div>
                    <div className="border-2 border-black bg-white h-12 flex items-center justify-center">
                      <p className="text-[8px] text-center font-semibold">Pictures Printed</p>
                    </div>
                    <div className="border-2 border-black bg-white h-12 flex items-center justify-center">
                      <p className="text-[8px] text-center font-semibold">Picture Taken</p>
                    </div>
                  </div>
                  {/* Second Row - New Stamps */}
                  <div className="grid grid-cols-3 gap-0.5">
                    <div className="border-2 border-black bg-white h-12 flex items-center justify-center">
                      <p className="text-[8px] text-center font-semibold">Paid</p>
                    </div>
                    <div className="border-2 border-black bg-white h-12 flex items-center justify-center">
                      <p className="text-[8px] text-center font-semibold">Pictures Picked Up</p>
                    </div>
                    <div className="border-2 border-black bg-white h-12 flex items-center justify-center">
                      <p className="text-[8px] text-center font-semibold opacity-0">Placeholder</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section - Compact */}
              <div>
                <p className="text-[9px] mb-0">Notes:</p>
                <div className="border border-black p-0.5 bg-white h-6 text-[8px]"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons (No Print) */}
          <div className="flex gap-4 mt-3 no-print">
            <Button
              onClick={handlePrint}
              size="lg"
              variant="outline"
              className="h-14 text-lg flex-1 active:scale-95 transition-transform select-none border-3 border-slate-600 bg-slate-100 hover:bg-slate-200 hover:border-slate-700 shadow-md font-semibold"
            >
              <Printer className="mr-2" />
              Print Receipt
            </Button>
            <Button
              onClick={onComplete}
              size="lg"
              className="h-14 text-lg flex-1 bg-green-600 hover:bg-green-700 active:bg-green-800 active:scale-95 transition-all select-none"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
