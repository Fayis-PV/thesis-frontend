import React from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "pill" | "dropdown";
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  variant = "icon",
  showLabel = false,
}) => {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full text-foreground/80 hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20",
        variant === "icon" &&
          "h-8 w-8 rounded-full border border-border/70 bg-card/60 hover:bg-muted/80 hover:border-border shadow-xs",
        variant === "pill" &&
          "h-8 px-3 gap-2 rounded-full border border-border/80 bg-card/70 hover:bg-muted text-xs font-medium",
        className,
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative h-4 w-4 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="dark"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center text-amber-400"
            >
              <Moon className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div
              key="light"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center text-amber-500"
            >
              <Sun className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="text-xs select-none">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
};
