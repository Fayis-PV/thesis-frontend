import { createContext, useContext, type ReactNode } from "react";

const TabsContext = createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);
export function Tabs({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}
export function TabsList({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-md p-1 ${className}`}
    >
      {children}
    </div>
  );
}
export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);
  return (
    <button
      type="button"
      onClick={() => context?.onValueChange(value)}
      className="rounded px-3 py-1.5 text-sm data-[state=active]:bg-white"
    >
      {children}
    </button>
  );
}
export function TabsContent({
  value,
  className = "",
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  const context = useContext(TabsContext);
  return context?.value === value ? (
    <div className={className}>{children}</div>
  ) : null;
}
