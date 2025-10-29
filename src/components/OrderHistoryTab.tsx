import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { KeyboardInput } from "./KeyboardInput";
import { 
  Search, 
  Printer, 
  Mail, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  User,
  Calendar,
  Image as ImageIcon,
  Eye,
  Send,
  Package,
  FileText,
  Camera,
  Upload,
  ArrowRight,
  Link2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export interface OrderHistoryRecord {
  orderNumber: string;
  customerNumber: string;
  timestamp: number;
  date: string;
  time: string;
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
  totalPrice: string;
  capturedPhotos: string[];
  pickupComplete: boolean;
  emailSent: boolean;
  picturesPrinted: boolean;
  pictureTaken: boolean;
  finalPhotos?: string[]; // Final photos uploaded by cameraman
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

export function OrderHistoryTab() {
  const [orders, setOrders] = useState<OrderHistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryRecord | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);

  useEffect(() => {
    loadOrders();
    
    // Set up an interval to periodically reload orders from localStorage
    // This ensures we pick up changes made by other components (like UploadFinalPhotoTab)
    const intervalId = setInterval(() => {
      loadOrders();
    }, 2000); // Reload every 2 seconds
    
    // Listen for custom event when order history is updated
    const handleOrderHistoryUpdate = () => {
      loadOrders();
    };
    window.addEventListener('orderHistoryUpdated', handleOrderHistoryUpdate);
    
    // Also listen for storage events (when localStorage changes in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'orderHistory') {
        loadOrders();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('orderHistoryUpdated', handleOrderHistoryUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadOrders = () => {
    try {
      const storedOrders = localStorage.getItem('orderHistory');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        // Ensure we have an array
        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders);
        } else {
          console.warn('Order history is not an array, but preserving data. Displaying empty until fixed.');
          setOrders([]);
          // DO NOT reset localStorage - preserve the data in case it can be recovered
        }
      }
    } catch (error) {
      console.error('Failed to load order history:', error);
      // DO NOT reset localStorage - preserve the data in case it can be recovered
      setOrders([]);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!order) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.orderNumber || '').toLowerCase().includes(searchLower) ||
      (order.customerNumber || '').toLowerCase().includes(searchLower) ||
      (order.userName || '').toLowerCase().includes(searchLower) ||
      (Array.isArray(order.emails) && order.emails.some(email => (email || '').toLowerCase().includes(searchLower)))
    );
  });

  const handleMarkPickupComplete = (orderNumber: string) => {
    if (!orderNumber) return;
    try {
      const updatedOrders = orders.map(order => 
        (order && order.orderNumber === orderNumber)
          ? { ...order, pickupComplete: !order.pickupComplete }
          : order
      );
      setOrders(updatedOrders);
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      window.dispatchEvent(new CustomEvent('orderHistoryUpdated'));
    } catch (error) {
      console.error('Failed to update pickup status:', error);
    }
  };

  const handleMarkEmailSent = (orderNumber: string) => {
    if (!orderNumber) return;
    try {
      const updatedOrders = orders.map(order => 
        (order && order.orderNumber === orderNumber)
          ? { ...order, emailSent: !order.emailSent }
          : order
      );
      setOrders(updatedOrders);
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      window.dispatchEvent(new CustomEvent('orderHistoryUpdated'));
    } catch (error) {
      console.error('Failed to update email sent status:', error);
    }
  };

  const handleMarkPicturesPrinted = (orderNumber: string) => {
    if (!orderNumber) return;
    try {
      const updatedOrders = orders.map(order => 
        (order && order.orderNumber === orderNumber)
          ? { ...order, picturesPrinted: !order.picturesPrinted }
          : order
      );
      setOrders(updatedOrders);
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      window.dispatchEvent(new CustomEvent('orderHistoryUpdated'));
    } catch (error) {
      console.error('Failed to update pictures printed status:', error);
    }
  };

  const handleMarkPictureTaken = (orderNumber: string) => {
    if (!orderNumber) return;
    try {
      const updatedOrders = orders.map(order => 
        (order && order.orderNumber === orderNumber)
          ? { ...order, pictureTaken: !order.pictureTaken }
          : order
      );
      setOrders(updatedOrders);
      localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
      window.dispatchEvent(new CustomEvent('orderHistoryUpdated'));
    } catch (error) {
      console.error('Failed to update picture taken status:', error);
    }
  };

  const handleViewReceipt = (order: OrderHistoryRecord) => {
    setSelectedOrder(order);
    setShowReceiptDialog(true);
  };

  const handleReprintReceipt = (order: OrderHistoryRecord) => {
    setSelectedOrder(order);
    setShowReceiptDialog(true);
    // Trigger print after a short delay to allow dialog to render
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleResendEmail = (order: OrderHistoryRecord) => {
    if (!order || !order.orderNumber) return;
    // In a real application, this would trigger an API call to resend emails
    const emailList = Array.isArray(order.emails) ? order.emails.join('\n') : 'No emails';
    alert(`Email resend requested for order ${order.orderNumber}\n\nIn production, this would send emails to:\n${emailList}`);
  };

  const getBackgroundName = (bgId: number | string): string => {
    if (typeof bgId === 'number') {
      const bg = backgrounds.find(b => b.id === bgId);
      return bg ? bg.name : `Background ${bgId}`;
    }
    
    const idStr = String(bgId);
    if (customBackgroundNames[idStr]) {
      return customBackgroundNames[idStr];
    }
    
    if (idStr.startsWith('uploaded-custom-')) {
      return `Custom Upload ${idStr.replace('uploaded-custom-', '')}`;
    }
    
    if (idStr.startsWith('custom-')) {
      return `Extra ${idStr.replace('custom-', '')}`;
    }
    
    return String(bgId);
  };

  return (
    <div className="space-y-4 pr-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
        <KeyboardInput
          type="text"
          placeholder="Search by order # (e.g., 0001), customer name, or email..."
          value={searchTerm}
          onChange={(value) => setSearchTerm(value)}
          className="pl-10 h-12 text-base bg-slate-800 text-white border-slate-600 placeholder:text-slate-400"
          fieldLabel="Search Orders"
        />
      </div>

      {/* Order Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">
          {filteredOrders.length === orders.length 
            ? `${orders.length} total orders` 
            : `${filteredOrders.length} of ${orders.length} orders`}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={loadOrders}
          className="h-8 bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
        >
          Refresh
        </Button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">
            {searchTerm ? "No orders match your search" : "No orders yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order, index) => {
            if (!order || !order.orderNumber) return null;
            return (
            <Card key={order.orderNumber || `order-${index}`} className="p-4 hover:shadow-md transition-shadow bg-slate-800 border-slate-700">
              <div className="flex gap-4">
                {/* Quick Photo Thumbnail */}
                <div className="flex-shrink-0">
                  {order.capturedPhotos && Array.isArray(order.capturedPhotos) && order.capturedPhotos.length > 0 && order.capturedPhotos[0] ? (
                    <img
                      src={order.capturedPhotos[0]}
                      alt="Customer Photo"
                      className="w-20 h-20 object-cover rounded border-2 border-slate-600"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-slate-700 rounded border-2 border-slate-600 flex items-center justify-center">
                      <User className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                </div>

                {/* Order Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-base truncate text-white">{order.userName || 'Unknown'}</h3>
                        {order.pictureTaken && (
                          <Badge variant="default" className="bg-purple-600 text-white text-xs">
                            <Camera className="w-3 h-3 mr-1" />
                            Photo Taken
                          </Badge>
                        )}
                        {order.emailSent && (
                          <Badge variant="default" className="bg-blue-600 text-white text-xs">
                            <Mail className="w-3 h-3 mr-1" />
                            Email Sent
                          </Badge>
                        )}
                        {order.picturesPrinted && (
                          <Badge variant="default" className="bg-orange-600 text-white text-xs">
                            <Printer className="w-3 h-3 mr-1" />
                            Printed
                          </Badge>
                        )}
                        {order.pickupComplete && (
                          <Badge variant="default" className="bg-green-600 text-white text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Picked Up
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="font-semibold text-sm text-blue-400">Order #{order.orderNumber || 'N/A'}</span>
                        <span>•</span>
                        <span className="font-mono text-xs">Customer: {order.customerNumber || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-lg text-green-400">
                        ${order.totalPrice || '0.00'}
                      </p>
                      {order.isFreeDay && (
                        <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200">Free Day</Badge>
                      )}
                    </div>
                  </div>

                  {/* Order Info Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Calendar className="w-3 h-3" />
                      <span>{order.date || 'N/A'} at {order.time || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300">
                      <DollarSign className="w-3 h-3" />
                      <span className="capitalize">{order.paymentType || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300">
                      <ImageIcon className="w-3 h-3" />
                      <span>{Array.isArray(order.selectedBackgrounds) ? order.selectedBackgrounds.length : 0} backgrounds</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-300">
                      <User className="w-3 h-3" />
                      <span>{order.numberOfPeople || '1'} {parseInt(order.numberOfPeople || '1') === 1 ? 'person' : 'people'}</span>
                    </div>
                  </div>

                  {/* Delivery Methods */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {Array.isArray(order.deliveryMethod) && order.deliveryMethod.includes('prints') && (
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-200">
                        <Printer className="w-3 h-3 mr-1" />
                        {order.numberOfPhotos || '0'} Prints
                      </Badge>
                    )}
                    {Array.isArray(order.deliveryMethod) && order.deliveryMethod.includes('email') && Array.isArray(order.emails) && order.emails.length > 0 && (
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-200">
                        <Mail className="w-3 h-3 mr-1" />
                        {order.emails.length} Emails
                      </Badge>
                    )}
                    {order.theme && (
                      <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200">
                        {order.theme}
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewReceipt(order)}
                      className="h-8 text-xs bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Receipt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReprintReceipt(order)}
                      className="h-8 text-xs bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                    >
                      <Printer className="w-3 h-3 mr-1" />
                      Reprint
                    </Button>
                    {Array.isArray(order.deliveryMethod) && order.deliveryMethod.includes('email') && Array.isArray(order.emails) && order.emails.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendEmail(order)}
                        className="h-8 text-xs bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Resend Email
                      </Button>
                    )}
                    
                    {/* Status Toggle Buttons */}
                    <Button
                      variant={order.pictureTaken ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleMarkPictureTaken(order.orderNumber)}
                      className={`h-8 text-xs ${order.pictureTaken ? 'bg-slate-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                    >
                      {order.pictureTaken ? (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Mark Not Taken
                        </>
                      ) : (
                        <>
                          <Camera className="w-3 h-3 mr-1" />
                          Mark Picture Taken
                        </>
                      )}
                    </Button>
                    
                    {Array.isArray(order.deliveryMethod) && order.deliveryMethod.includes('email') && Array.isArray(order.emails) && order.emails.length > 0 && (
                      <Button
                        variant={order.emailSent ? "secondary" : "default"}
                        size="sm"
                        onClick={() => handleMarkEmailSent(order.orderNumber)}
                        className={`h-8 text-xs ${order.emailSent ? 'bg-slate-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      >
                        {order.emailSent ? (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Mark Not Sent
                          </>
                        ) : (
                          <>
                            <Mail className="w-3 h-3 mr-1" />
                            Mark Email Sent
                          </>
                        )}
                      </Button>
                    )}
                    
                    {Array.isArray(order.deliveryMethod) && order.deliveryMethod.includes('prints') && (
                      <>
                        <Button
                          variant={order.picturesPrinted ? "secondary" : "default"}
                          size="sm"
                          onClick={() => handleMarkPicturesPrinted(order.orderNumber)}
                          className={`h-8 text-xs ${order.picturesPrinted ? 'bg-slate-700 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
                        >
                          {order.picturesPrinted ? (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Mark Not Printed
                            </>
                          ) : (
                            <>
                              <Printer className="w-3 h-3 mr-1" />
                              Mark Pictures Printed
                            </>
                          )}
                        </Button>
                        
                        <Button
                          variant={order.pickupComplete ? "secondary" : "default"}
                          size="sm"
                          onClick={() => handleMarkPickupComplete(order.orderNumber)}
                          className={`h-8 text-xs ${order.pickupComplete ? 'bg-slate-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                        >
                          {order.pickupComplete ? (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Mark Pending
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Mark Picked Up
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}

      {/* Receipt View Dialog */}
      {selectedOrder && (
        <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 text-white border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Order Receipt - #{selectedOrder.orderNumber}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Complete order details for {selectedOrder.userName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Order Number Linking ID */}
              <Card className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 border-blue-500">
                <div className="text-center">
                  <p className="text-white text-sm mb-1">Linking ID</p>
                  <p className="text-yellow-300 font-bold text-3xl tracking-wider">#{selectedOrder.orderNumber}</p>
                  <p className="text-blue-100 text-xs mt-2">This Order Number links the receipt, quick photo, and final photo together</p>
                </div>
              </Card>
              {/* Customer & Order Info */}
              <Card className="p-4 bg-slate-800 border-slate-700">
                <h3 className="font-semibold mb-3 text-white">Customer Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400">Customer Name</p>
                    <p className="font-medium text-slate-200">{selectedOrder.userName || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Order Number</p>
                    <p className="font-semibold text-lg text-blue-400">#{selectedOrder.orderNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Customer Number</p>
                    <p className="font-medium font-mono text-slate-200">{selectedOrder.customerNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Date & Time</p>
                    <p className="font-medium text-slate-200">{selectedOrder.date || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{selectedOrder.time || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Payment Method</p>
                    <p className="font-medium capitalize text-slate-200">{selectedOrder.paymentType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Number of People</p>
                    <p className="font-medium text-slate-200">{selectedOrder.numberOfPeople || '1'}</p>
                  </div>
                  {selectedOrder.theme && (
                    <div>
                      <p className="text-slate-400">Event Theme</p>
                      <p className="font-medium text-slate-200">{selectedOrder.theme}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Photos Section - Quick Photo and Final Photos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quick Photo Display */}
                {selectedOrder.capturedPhotos && Array.isArray(selectedOrder.capturedPhotos) && selectedOrder.capturedPhotos.length > 0 && selectedOrder.capturedPhotos[0] && (
                  <Card className="p-4 bg-slate-800 border-blue-600 border-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Camera className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-white">Quick Photo (Selfie)</h3>
                    </div>
                    <img
                      src={selectedOrder.capturedPhotos[0]}
                      alt="Customer Selfie"
                      className="w-full rounded border-2 border-blue-400"
                    />
                    <div className="mt-2 bg-blue-900/30 border border-blue-600 rounded p-2">
                      <p className="text-blue-300 text-xs font-semibold">Taken at Kiosk</p>
                      <p className="text-blue-200 text-xs">Order #{selectedOrder.orderNumber}</p>
                    </div>
                  </Card>
                )}

                {/* Final Photos Display */}
                {selectedOrder.finalPhotos && Array.isArray(selectedOrder.finalPhotos) && selectedOrder.finalPhotos.length > 0 ? (
                  <Card className="p-4 bg-slate-800 border-green-600 border-2">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-white">Final Photo{selectedOrder.finalPhotos.length > 1 ? 's' : ''} ({selectedOrder.finalPhotos.length})</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedOrder.finalPhotos.map((photo, index) => (
                        <div key={index}>
                          <img
                            src={photo}
                            alt={`Final Photo ${index + 1}`}
                            className="w-full rounded border-2 border-green-400"
                          />
                          {index < selectedOrder.finalPhotos!.length - 1 && (
                            <div className="h-2" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 bg-green-900/30 border border-green-600 rounded p-2">
                      <p className="text-green-300 text-xs font-semibold">Uploaded by Cameraman</p>
                      <p className="text-green-200 text-xs">Matched to Order #{selectedOrder.orderNumber}</p>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4 bg-slate-800 border-slate-600 border-2 border-dashed">
                    <div className="flex items-center gap-2 mb-3">
                      <Upload className="w-5 h-5 text-slate-500" />
                      <h3 className="font-semibold text-slate-400">Final Photo - Pending</h3>
                    </div>
                    <div className="aspect-square bg-slate-700 rounded flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No final photo uploaded yet</p>
                        <p className="text-slate-600 text-xs mt-1">Upload via Admin Console</p>
                      </div>
                    </div>
                    <div className="mt-2 bg-slate-700 rounded p-2">
                      <p className="text-slate-400 text-xs">Expected filename:</p>
                      <p className="text-slate-300 text-xs font-mono">{selectedOrder.orderNumber}.jpg</p>
                    </div>
                  </Card>
                )}
              </div>

              {/* Selected Backgrounds */}
              <Card className="p-4 bg-slate-800 border-slate-700">
                <h3 className="font-semibold mb-3 text-white">Selected Backgrounds ({Array.isArray(selectedOrder.selectedBackgrounds) ? selectedOrder.selectedBackgrounds.length : 0})</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Array.isArray(selectedOrder.selectedBackgrounds) && selectedOrder.selectedBackgrounds.map((bgId, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-slate-700 rounded border border-slate-600">
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-200">{getBackgroundName(bgId)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Delivery Details & Status */}
              <Card className="p-4 bg-slate-800 border-slate-700">
                <h3 className="font-semibold mb-3 text-white">Delivery Details & Status</h3>
                <div className="space-y-4">
                  {/* Picture Taken Status */}
                  <div className="flex items-start gap-2">
                    <Camera className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">Green Screen Photo</p>
                      <p className="text-sm text-slate-400 mb-1">Professional photo session</p>
                      {selectedOrder.pictureTaken ? (
                        <Badge variant="default" className="bg-purple-600 text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Photo Taken
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  {Array.isArray(selectedOrder.deliveryMethod) && selectedOrder.deliveryMethod.includes('prints') && (
                    <>
                      <Separator className="bg-slate-700" />
                      <div className="flex items-start gap-2">
                        <Printer className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-200">Physical Prints</p>
                          <p className="text-sm text-slate-400 mb-2">{selectedOrder.numberOfPhotos || '0'} prints</p>
                          <div className="flex gap-2 flex-wrap">
                            {selectedOrder.picturesPrinted ? (
                              <Badge variant="default" className="bg-orange-600 text-white">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Printed
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Not Printed
                              </Badge>
                            )}
                            {selectedOrder.pickupComplete ? (
                              <Badge variant="default" className="bg-green-600 text-white">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Picked Up
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Awaiting Pickup
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {Array.isArray(selectedOrder.deliveryMethod) && selectedOrder.deliveryMethod.includes('email') && Array.isArray(selectedOrder.emails) && selectedOrder.emails.length > 0 && (
                    <>
                      <Separator className="bg-slate-700" />
                      <div className="flex items-start gap-2">
                        <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium mb-1 text-slate-200">Email Delivery</p>
                          <div className="space-y-1 mb-2">
                            {selectedOrder.emails.map((email, index) => (
                              <p key={index} className="text-sm text-slate-400 font-mono">{email || 'N/A'}</p>
                            ))}
                          </div>
                          {selectedOrder.emailSent ? (
                            <Badge variant="default" className="bg-blue-600 text-white">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Email Sent
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                              <Clock className="w-3 h-3 mr-1" />
                              Not Sent
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Pricing Breakdown */}
              <Card className="p-4 bg-slate-800 border-slate-700">
                <h3 className="font-semibold mb-3 text-white">Pricing Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Base Price:</span>
                    <span className="font-medium text-slate-200">${selectedOrder.basePrice || '0.00'}</span>
                  </div>
                  {Array.isArray(selectedOrder.deliveryMethod) && selectedOrder.deliveryMethod.includes('prints') && (
                    <div className="flex justify-between">
                      <span className="text-slate-300">Prints ({selectedOrder.numberOfPhotos || '0'} × $2.00):</span>
                      <span className="font-medium text-slate-200">${(parseInt(selectedOrder.numberOfPhotos || '0') * 2).toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className="bg-slate-700" />
                  <div className="flex justify-between text-base pt-2">
                    <span className="font-semibold text-slate-200">Total Amount:</span>
                    <span className="font-semibold text-green-400">${selectedOrder.totalPrice || '0.00'}</span>
                  </div>
                  {selectedOrder.isFreeDay && (
                    <p className="text-xs text-center text-green-400 mt-2">✨ Free Day - No charge ✨</p>
                  )}
                </div>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
