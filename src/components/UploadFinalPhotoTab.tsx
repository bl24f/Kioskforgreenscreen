import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Upload, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Trash2
} from "lucide-react";
import { OrderHistoryRecord } from "./OrderHistoryTab";

export function UploadFinalPhotoTab() {
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; preview: string; orderNumber: string | null; matched: boolean }[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractOrderNumber = (filename: string): string | null => {
    // Extract order number from filename (e.g., "0001.jpg", "Order-0042.png", "photo_0123.jpeg")
    const patterns = [
      /^(\d{4})\./,                    // 0001.jpg
      /order[_-]?(\d{4})/i,            // order-0001.jpg, Order_0042.png
      /photo[_-]?(\d{4})/i,            // photo_0001.jpg, Photo-0042.png
      /(\d{4})[_-]?photo/i,            // 0001_photo.jpg
      /(\d{4})/,                       // Any 4-digit number
    ];

    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const findMatchingOrder = (orderNumber: string): OrderHistoryRecord | null => {
    try {
      const storedOrders = localStorage.getItem('orderHistory');
      if (!storedOrders) return null;

      const orders: OrderHistoryRecord[] = JSON.parse(storedOrders);
      return orders.find(order => order.orderNumber === orderNumber) || null;
    } catch (error) {
      console.error('Error finding matching order:', error);
      return null;
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const filesArray = Array.from(files);
    const validFiles: File[] = [];
    
    // Validate files first - accept all common image formats
    for (const file of filesArray) {
      const validImageTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/bmp',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/tiff',
        'image/svg+xml'
      ];
      
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.heic', '.heif', '.tiff', '.tif', '.svg'];
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (validImageTypes.includes(file.type) || hasValidExtension) {
        validFiles.push(file);
      } else {
        setUploadStatus({
          type: 'error',
          message: `"${file.name}" is not a valid image file.`
        });
      }
    }

    if (validFiles.length === 0) {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Process all valid files
    const newFiles: typeof uploadedFiles = [];
    
    for (const file of validFiles) {
      const orderNumber = extractOrderNumber(file.name);
      const matched = orderNumber ? findMatchingOrder(orderNumber) !== null : false;

      try {
        const preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newFiles.push({
          file,
          preview,
          orderNumber,
          matched
        });
      } catch (error) {
        console.error('Error reading file:', file.name, error);
      }
    }

    // Update state with all new files
    if (newFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      const matchedCount = newFiles.filter(f => f.matched).length;
      const unmatchedCount = newFiles.length - matchedCount;

      if (matchedCount > 0 && unmatchedCount === 0) {
        setUploadStatus({
          type: 'success',
          message: `Successfully matched ${matchedCount} photo${matchedCount > 1 ? 's' : ''} to existing orders!`
        });
      } else if (matchedCount > 0 && unmatchedCount > 0) {
        setUploadStatus({
          type: 'info',
          message: `Matched ${matchedCount} photo${matchedCount > 1 ? 's' : ''}, but ${unmatchedCount} photo${unmatchedCount > 1 ? 's' : ''} could not be matched.`
        });
      } else {
        setUploadStatus({
          type: 'info',
          message: `Uploaded ${unmatchedCount} photo${unmatchedCount > 1 ? 's' : ''}. No order numbers found in filenames.`
        });
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadToOrders = () => {
    try {
      const storedOrders = localStorage.getItem('orderHistory');
      if (!storedOrders) {
        setUploadStatus({
          type: 'error',
          message: 'No orders found in the system.'
        });
        return;
      }

      let orders: OrderHistoryRecord[] = JSON.parse(storedOrders);
      let uploadCount = 0;

      uploadedFiles.forEach(({ preview, orderNumber, matched }) => {
        if (matched && orderNumber) {
          orders = orders.map(order => {
            if (order.orderNumber === orderNumber) {
              const existingPhotos = order.finalPhotos || [];
              // Avoid duplicates
              if (!existingPhotos.includes(preview)) {
                uploadCount++;
                return {
                  ...order,
                  finalPhotos: [...existingPhotos, preview]
                };
              }
            }
            return order;
          });
        }
      });

      localStorage.setItem('orderHistory', JSON.stringify(orders));
      
      // Dispatch a custom event to notify other components that order history was updated
      window.dispatchEvent(new CustomEvent('orderHistoryUpdated'));
      
      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${uploadCount} final photo${uploadCount > 1 ? 's' : ''} to matched orders!`
      });

      // Clear uploaded files after successful upload
      setTimeout(() => {
        setUploadedFiles([]);
      }, 2000);

    } catch (error) {
      console.error('Error uploading to orders:', error);
      setUploadStatus({
        type: 'error',
        message: 'Failed to upload photos. Please try again.'
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadStatus(null);
  };

  const clearAll = () => {
    setUploadedFiles([]);
    setUploadStatus(null);
  };

  return (
    <div className="space-y-4 pr-4">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Upload Final Photos</h3>
        <p className="text-slate-300 text-sm mb-4">
          Upload final green screen photos (all image formats supported). The system will automatically match them to orders based on the order number in the filename.
        </p>

        {/* File naming instructions */}
        <Card className="p-4 bg-slate-900 border-blue-700 mb-6">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">File Naming Guidelines:</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li>• <span className="text-blue-300 font-mono">0001.jpg</span> - Order number only</li>
                <li>• <span className="text-blue-300 font-mono">Order-0042.png</span> - With "Order" prefix</li>
                <li>• <span className="text-blue-300 font-mono">photo_0123.jpeg</span> - With "photo" prefix</li>
                <li className="text-yellow-300 mt-2">The order number must be 4 digits (e.g., 0001, 0042, 0123)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Upload Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload" className="text-white mb-2 block">
              Select Final Photos (All Image Formats)
            </Label>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.webp,.heic,.heif,.tiff,.tif,.svg"
              multiple
              onChange={handleFileSelect}
              className="flex h-12 w-full rounded-md px-3 py-2 text-sm bg-slate-700 text-white border-2 border-slate-600 file:bg-blue-600 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded file:cursor-pointer hover:file:bg-blue-700 cursor-pointer"
            />
          </div>

          {/* Upload Status */}
          {uploadStatus && (
            <Alert 
              variant={uploadStatus.type === 'error' ? 'destructive' : 'default'}
              className={
                uploadStatus.type === 'success' 
                  ? 'bg-green-900/50 border-green-600 text-green-200' 
                  : uploadStatus.type === 'info'
                  ? 'bg-blue-900/50 border-blue-600 text-blue-200'
                  : 'bg-red-900/50 border-red-600'
              }
            >
              {uploadStatus.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : uploadStatus.type === 'info' ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription className="ml-2">
                {uploadStatus.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white">
                  Uploaded Files ({uploadedFiles.length})
                </h4>
                <div className="flex gap-2">
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </Button>
                  <Button
                    onClick={handleUploadToOrders}
                    disabled={uploadedFiles.filter(f => f.matched).length === 0}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload to Orders ({uploadedFiles.filter(f => f.matched).length})
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedFiles.map((item, index) => (
                  <Card 
                    key={index} 
                    className={`p-3 ${
                      item.matched 
                        ? 'bg-slate-800 border-green-600 border-2' 
                        : 'bg-slate-800 border-red-600 border-2'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={item.preview}
                        alt={item.file.name}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <Button
                        onClick={() => removeFile(index)}
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-300 truncate" title={item.file.name}>
                        {item.file.name}
                      </p>
                      {item.matched && item.orderNumber ? (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-xs font-semibold">
                            Matched to Order #{item.orderNumber}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs font-semibold">
                            {item.orderNumber 
                              ? `Order #${item.orderNumber} not found` 
                              : 'No order number in filename'}
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {uploadedFiles.length === 0 && (
            <div className="text-center py-12 bg-slate-900 rounded-lg border-2 border-dashed border-slate-700">
              <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">
                No photos uploaded yet
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Select image files to begin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
