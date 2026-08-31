import type { HTMLAttributes, ReactNode } from "react";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open = false, onOpenChange, children }: DialogProps) {
  return open ? (
    <div
      className="fixed inset-0 z-50 bg-black/50"
      onClick={() => onOpenChange?.(false)}
    >
      {children}
    </div>
  ) : null;
}

export function DialogContent({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-lg sm:rounded-lg ${className}`}
      onClick={(event) => event.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  );
}
export function DialogDescription(props: HTMLAttributes<HTMLParagraphElement>) {
  return <p className="text-sm text-gray-500" {...props} />;
}
export function DialogFooter({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex justify-end gap-2 ${className}`} {...props} />;
}
export function DialogHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`} {...props} />
  );
}
export function DialogTitle(props: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className="text-lg font-semibold" {...props} />;
}
