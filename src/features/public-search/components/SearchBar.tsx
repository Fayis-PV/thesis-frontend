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
        className="h-12 pl-12 pr-12 border-2 border-blue-100 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 rounded-xl text-sm text-gray-900 transition-all duration-300 bg-white shadow-sm hover:shadow-md w-full"
      />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300">
        {isSearching ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        ) : (
          <Search className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
        )}
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {searchTerm && !isSearching && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="h-8 w-8 p-0 hover:bg-blue-50 rounded-full transition-all"
          >
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        )}
        {isFocused && !searchTerm && (
          <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
        )}
      </div>
    </div>
  );
};
