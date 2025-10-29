import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { KeyboardInput } from "./KeyboardInput";
import { Lock, X } from "lucide-react";

interface AdminPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPasswordCorrect: () => void;
}

const ADMIN_PASSWORD = "admin123";

export function AdminPasswordDialog({
  open,
  onOpenChange,
  onPasswordCorrect,
}: AdminPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setPassword("");
      setError("");
      onPasswordCorrect();
      onOpenChange(false);
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onOpenChange(false);
  };

  const handleEnter = () => {
    handleSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/80 backdrop-blur-sm" />
        <DialogContent className="sm:max-w-md bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Lock className="w-5 h-5" />
            Admin Access
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Enter the admin password to access settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="adminPassword" className="text-slate-200">
              Password
            </Label>
            <KeyboardInput
              id="adminPassword"
              type="password"
              value={password}
              onChange={setPassword}
              onEnter={handleEnter}
              placeholder="Enter admin password"
              className={`h-12 text-lg bg-slate-800 text-white border-slate-600 placeholder:text-slate-400 ${
                error ? "border-red-500 border-2" : ""
              }`}
              fieldLabel="Admin Password"
            />
            {error && (
              <p className="text-xs text-red-400 font-semibold">{error}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 h-12 text-lg bg-slate-800 text-white border-slate-600 hover:bg-slate-700"
            >
              <X className="mr-2 w-5 h-5" />
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 h-12 text-lg bg-green-600 hover:bg-green-700 text-white"
            >
              <Lock className="mr-2 w-5 h-5" />
              Access Admin
            </Button>
          </div>
        </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
