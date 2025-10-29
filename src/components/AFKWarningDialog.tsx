import { useEffect, useRef, useState, useCallback, memo } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { AlertCircle } from "lucide-react";

interface AFKWarningDialogProps {
  onTimeout: () => void;
  initialTimeoutSeconds?: number;
  warningTimeoutSeconds?: number;
}

export const AFKWarningDialog = memo(function AFKWarningDialog({
  onTimeout,
  initialTimeoutSeconds = 60,
  warningTimeoutSeconds = 20,
}: AFKWarningDialogProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(warningTimeoutSeconds);
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  const lastActivityRef = useRef<number>(Date.now());

  // Keep the onTimeout ref up to date
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    // Throttle: only reset if at least 200ms has passed since last activity
    const now = Date.now();
    if (now - lastActivityRef.current < 200) {
      return;
    }
    lastActivityRef.current = now;

    // Dismiss warning if showing
    setShowWarning(false);

    // Clear all existing timers
    if (initialTimeoutRef.current) clearTimeout(initialTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Set initial timeout to show warning
    initialTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(warningTimeoutSeconds);

      // Start countdown
      let countdown = warningTimeoutSeconds;
      countdownRef.current = setInterval(() => {
        countdown -= 1;
        setSecondsLeft(countdown);

        if (countdown <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          // Trigger timeout
          onTimeoutRef.current();
        }
      }, 1000);

      // Set warning timeout
      warningTimeoutRef.current = setTimeout(() => {
        onTimeoutRef.current();
      }, warningTimeoutSeconds * 1000);
    }, initialTimeoutSeconds * 1000);
  }, [initialTimeoutSeconds, warningTimeoutSeconds]);

  const handleStillHere = useCallback(() => {
    setShowWarning(false);
    resetTimer();
  }, [resetTimer]);

  const handleLeave = useCallback(() => {
    onTimeoutRef.current();
  }, []);

  useEffect(() => {
    resetTimer();

    // Listen for user activity
    const events = ["mousedown", "keydown", "touchstart", "click", "scroll"];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      // Clear timers
      if (initialTimeoutRef.current) clearTimeout(initialTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);

      // Remove event listeners
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent className="sm:max-w-2xl bg-white border-slate-300">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-6">
            <div className="w-28 h-28 bg-yellow-500/20 rounded-full flex items-center justify-center animate-pulse border-2 border-yellow-500/50">
              <AlertCircle className="w-16 h-16 text-yellow-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-5xl mb-4 text-slate-900">
            Are You Still There?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-2xl pt-4 text-slate-700">
            Touch the screen to continue.
          </AlertDialogDescription>
          <div className="text-center">
            <div className="text-6xl text-yellow-500 mt-8 mb-4 animate-pulse">
              {secondsLeft}
            </div>
            <div className="text-xl text-slate-500">
              Returning to home screen
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center justify-center mt-8 sm:justify-center">
          <Button
            onClick={handleStillHere}
            size="lg"
            className="w-full max-w-md h-20 text-2xl bg-green-600 hover:bg-green-700 active:bg-green-800 active:scale-95 transition-all select-none"
          >
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});