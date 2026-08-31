import {
  createContext,
  useContext,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

const AlertDialogContext = createContext<{ close: () => void } | null>(null);
interface RootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}
export function AlertDialog({
  open = false,
  onOpenChange,
  children,
}: RootProps) {
  return (
    <AlertDialogContext.Provider value={{ close: () => onOpenChange?.(false) }}>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/50">{children}</div>
      ) : null}
    </AlertDialogContext.Provider>
  );
}
export function AlertDialogContent({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 bg-white p-6 shadow-lg sm:rounded-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
export function AlertDialogHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`} {...props} />
  );
}
export function AlertDialogFooter({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex justify-end gap-2 ${className}`} {...props} />;
}
export function AlertDialogTitle(props: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className="text-lg font-semibold" {...props} />;
}
export function AlertDialogDescription(
  props: HTMLAttributes<HTMLParagraphElement>,
) {
  return <p className="text-sm text-gray-500" {...props} />;
}
export function AlertDialogCancel({
  children,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(AlertDialogContext);
  return (
    <button
      type="button"
      onClick={(event) => {
        onClick?.(event);
        context?.close();
      }}
      {...props}
    >
      {children}
    </button>
  );
}
export function AlertDialogAction({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" {...props}>
      {children}
    </button>
  );
}
