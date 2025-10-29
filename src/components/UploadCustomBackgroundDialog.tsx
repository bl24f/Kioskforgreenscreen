import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Upload, Camera, X } from "lucide-react";

interface UploadCustomBackgroundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (imageData: string) => void;
}

export function UploadCustomBackgroundDialog({
  open,
  onOpenChange,
  onUploadComplete,
}: UploadCustomBackgroundDialogProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMessage("This file type is not accepted. Please upload an image file.");
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDone = () => {
    if (uploadedImage) {
      onUploadComplete(uploadedImage);
      setUploadedImage(null);
      onOpenChange(false);
    }
  };

  const handleExit = () => {
    setUploadedImage(null);
    setErrorMessage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-white border-4 border-purple-500 rounded-2xl overflow-hidden">
        <DialogHeader className="p-8 pb-6 bg-gradient-to-r from-purple-500 to-pink-500">
          <DialogTitle className="text-3xl text-white text-center">
            Upload Your Custom Background
          </DialogTitle>
          <DialogDescription className="text-white/90 text-center text-lg">
            Follow the steps below to upload your custom photo background
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6">
          {/* Step-by-step Instructions */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
            <h3 className="text-xl text-purple-900 mb-4">Follow these steps:</h3>
            <ol className="space-y-3 text-lg text-purple-800">
              <li className="flex items-start gap-3">
                <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Plug in your device</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>Allow access to your device</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Upload your photo</span>
              </li>
            </ol>
          </div>

          {/* Upload Area or Preview */}
          {!uploadedImage ? (
            <div
              onClick={handleClickUpload}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-4 border-dashed rounded-2xl p-12 cursor-pointer transition-all active:scale-98 select-none ${
                isDragging
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-300 bg-slate-50 hover:border-purple-400 hover:bg-purple-50/50"
              }`}
            >
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-6">
                  {isDragging ? (
                    <Upload className="w-16 h-16 text-white" />
                  ) : (
                    <Camera className="w-16 h-16 text-white" />
                  )}
                </div>
                <div>
                  <p className="text-2xl text-slate-900 mb-2">
                    Tap to select a photo
                  </p>
                  <p className="text-lg text-slate-600">
                    or drag and drop it here
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border-4 border-purple-500 shadow-xl">
                <img
                  src={uploadedImage}
                  alt="Uploaded background"
                  className="w-full h-auto max-h-96 object-contain bg-slate-100"
                />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-all active:scale-95"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-center text-lg text-green-600">
                ✓ Photo uploaded successfully!
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6">
              <p className="text-xl text-red-700 text-center">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleExit}
              variant="outline"
              size="lg"
              className="flex-1 h-16 text-xl border-3 border-slate-600 bg-slate-100 hover:bg-slate-200 hover:border-slate-700 active:scale-95 transition-all select-none shadow-md font-semibold"
            >
              Exit
            </Button>
            <Button
              onClick={handleDone}
              disabled={!uploadedImage}
              size="lg"
              className="flex-1 h-16 text-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all select-none"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
