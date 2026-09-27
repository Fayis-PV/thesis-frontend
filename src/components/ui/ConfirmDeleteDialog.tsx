import { AlertTriangle, X } from "lucide-react";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title: string;
  description: React.ReactNode;
}

export const ConfirmDeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  title,
  description,
}: ConfirmDeleteDialogProps) => {
  if (!isOpen) return null;

  return (
    // z-[70] ensures this safety dialog always appears on top of everything else
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-card text-card-foreground border border-border text-left align-middle shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Warning Icon */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 sm:h-12 sm:w-12">
              <AlertTriangle
                className="h-6 w-6 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            </div>

            {/* Text Content */}
            <div className="mt-1 flex-1">
              <h3 className="text-lg font-bold leading-6 text-foreground">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-muted/30 px-6 py-4 flex justify-end gap-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="inline-flex justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-xs hover:bg-muted focus:outline-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-red-700 focus:outline-none disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Deleting...
              </span>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
