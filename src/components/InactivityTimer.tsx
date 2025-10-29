import { useEffect, useRef, useState, useCallback, memo } from "react";
import { AlertCircle } from "lucide-react";

interface InactivityTimerProps {
  onTimeout: () => void;
  timeoutSeconds: number;
}

export const InactivityTimer = memo(function InactivityTimer({ onTimeout, timeoutSeconds }: InactivityTimerProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeoutRef = useRef(onTimeout);
  const lastResetRef = useRef<number>(Date.now());

  // Keep the onTimeout ref up to date
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    // Throttle: only reset if at least 500ms has passed since last reset
    const now = Date.now();
    if (now - lastResetRef.current < 500) {
      return;
    }
    lastResetRef.current = now;

    setShowWarning(false);
    
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Set warning timer (30 seconds before timeout)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setSecondsLeft(30);
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, (timeoutSeconds - 30) * 1000);

    // Set main timeout
    timeoutRef.current = setTimeout(() => {
      onTimeoutRef.current();
    }, timeoutSeconds * 1000);
  }, [timeoutSeconds]);

  useEffect(() => {
    resetTimer();

    // Listen for user activity - reduced event set for better performance
    const events = ['mousedown', 'keypress', 'touchstart', 'click'];
    
    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      // Clear timers
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      
      // Remove event listeners
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-pulse">
      <AlertCircle className="w-6 h-6" />
      <div>
        <p className="font-medium">Still there?</p>
        <p className="text-sm">Resetting in {secondsLeft} seconds...</p>
      </div>
    </div>
  );
});
