import {
  createContext,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";

const MenuContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);
export function DropdownMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </MenuContext.Provider>
  );
}
export function DropdownMenuTrigger({
  children,
  asChild,
}: {
  children: ReactNode;
  asChild?: boolean;
}) {
  const context = useContext(MenuContext);
  return asChild ? (
    <span onClick={() => context?.setOpen(!context.open)}>{children}</span>
  ) : (
    <button type="button" onClick={() => context?.setOpen(!context.open)}>
      {children}
    </button>
  );
}
export function DropdownMenuContent({
  className = "",
  children,
}: HTMLAttributes<HTMLDivElement> & { align?: string }) {
  const context = useContext(MenuContext);
  return context?.open ? (
    <div
      className={`absolute right-0 z-50 mt-1 min-w-40 rounded-md border bg-white p-1 shadow-md ${className}`}
    >
      {children}
    </div>
  ) : null;
}
export function DropdownMenuItem({
  className = "",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = useContext(MenuContext);
  return (
    <button
      type="button"
      className={`flex w-full items-center rounded px-2 py-1.5 text-left text-sm hover:bg-gray-100 ${className}`}
      onClick={(event) => {
        onClick?.(event);
        context?.setOpen(false);
      }}
      {...props}
    />
  );
}
export function DropdownMenuSeparator({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`my-1 h-px bg-gray-200 ${className}`} {...props} />;
}
