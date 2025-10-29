import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface CancelConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CancelConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: CancelConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl">Cancel Session?</AlertDialogTitle>
          <AlertDialogDescription className="text-lg">
            Are you sure you want to cancel? All progress will be lost and you'll be returned to the start.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel className="h-14 text-lg select-none active:scale-95 transition-transform">
            No, Continue
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="h-14 text-lg bg-red-600 hover:bg-red-700 active:bg-red-800 select-none active:scale-95 transition-all"
          >
            Yes, Cancel Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
