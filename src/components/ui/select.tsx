import { createContext, useContext, useState, type ReactNode } from "react";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled: boolean;
}
const SelectContext = createContext<SelectContextValue | null>(null);

export function Select({
  value = "",
  onValueChange,
  disabled = false,
  children,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider
      value={{ value, onValueChange, open, setOpen, disabled }}
    >
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
}
export function SelectTrigger({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const context = useContext(SelectContext);
  return (
    <button
      type="button"
      disabled={context?.disabled}
      onClick={() => context?.setOpen(!context.open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm ${className}`}
    >
      {children}
    </button>
  );
}
export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span>{placeholder}</span>;
}
export function SelectContent({
  className = "",
  children,
}: {
  className?: string;
  position?: "item-aligned" | "popper";
  children: ReactNode;
}) {
  const context = useContext(SelectContext);
  if (!context?.open) return null;
  return (
    <div
      className={`absolute z-50 mt-1 max-h-96 min-w-full overflow-auto rounded-md border bg-white p-1 shadow-md ${className}`}
    >
      {children}
    </div>
  );
}
export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const context = useContext(SelectContext);
  if (!context) return null;
  return (
    <button
      type="button"
      className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-gray-100"
      onClick={() => {
        context.onValueChange(value);
        context.setOpen(false);
      }}
    >
      {children}
    </button>
  );
}
