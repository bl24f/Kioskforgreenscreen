import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { HelpCircle } from "lucide-react";

export function HelpButton() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {/* Floating Help Button */}
      <Button
        onClick={() => setShowHelp(true)}
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg bg-card border-border hover:bg-accent hover:border-primary/50 transition-all active:scale-95 select-none"
        aria-label="Help"
      >
        <HelpCircle className="w-6 h-6" />
      </Button>

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl">How to Use</DialogTitle>
            <DialogDescription>
              Follow these simple steps to create your green screen photo
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <ol className="space-y-4 text-lg">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                  1
                </span>
                <span>
                  Use this program to choose a backdrop for your green screen
                  photo
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                  2
                </span>
                <span>Select your delivery method (email or prints)</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                  3
                </span>
                <span>
                  Choose from our amazing collection of backgrounds
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                  4
                </span>
                <span>
                  Enter your information and confirm your selection
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                  5
                </span>
                <span>
                  Take a short photo. This is only used to match your face to
                  the final green screen picture; it will not be part of your
                  actual photo
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                  6
                </span>
                <span>Complete payment and grab your photos!</span>
              </li>
            </ol>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setShowHelp(false)}
              size="lg"
              className="min-w-32"
            >
              Got It
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}