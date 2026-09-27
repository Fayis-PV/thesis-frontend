import React, { useState, useEffect } from "react";
import { Search, Loader2, X, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  searchTerm: string;
  onChange: (value: string) => void;
  isSearching: boolean;
}

const suggestions = [
  "machine learning algorithms",
  "climate change impact",
  "artificial intelligence",
  "renewable energy systems",
  "quantum computing",
  "biomedical engineering",
];
const defaultPlaceholder = "Search by title, author, keywords...";

export const SearchBar: React.FC<Props> = ({
  searchTerm,
  onChange,
  isSearching,
}) => {
  const [placeholder, setPlaceholder] = useState(defaultPlaceholder);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isFocused || searchTerm) {
      return;
    }

    const interval = setInterval(() => {
      setPlaceholder(
        `Try: "${suggestions[Math.floor(Math.random() * suggestions.length)]}"`,
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [isFocused, searchTerm]);
  const displayedPlaceholder =
    isFocused || searchTerm ? defaultPlaceholder : placeholder;

  return (
    <div className="relative group w-full">
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={displayedPlaceholder}
        className="h-12 pl-12 pr-12 border border-border focus-visible:border-primary focus-visible:ring-primary/20 rounded-xl text-sm text-foreground transition-all duration-300 bg-card shadow-xs hover:border-primary/40 w-full placeholder:text-muted-foreground"
      />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300">
        {isSearching ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        ) : (
          <Search className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
        )}
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {searchTerm && !isSearching && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="h-8 w-8 p-0 hover:bg-muted rounded-full transition-all"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </Button>
        )}
        {isFocused && !searchTerm && (
          <Sparkles className="h-4 w-4 text-accent animate-pulse" />
        )}
      </div>
    </div>
  );
};
