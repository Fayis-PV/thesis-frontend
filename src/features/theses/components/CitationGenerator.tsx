import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import type { Thesis } from "@/types/api";

export default function CitationGenerator({ thesis }: { thesis: Thesis }) {
  const [copied, setCopied] = useState(false);

  const author = thesis.author_name || "Unknown Author";
  const year = thesis.year || new Date().getFullYear();
  const title = thesis.title;
  const institution =
    thesis.institution?.name || "Darul Huda Islamic University";

  const apaCitation = `${author} (${year}). ${title} [Thesis, ${institution}].`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apaCitation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Button
        variant="outline"
        className="font-medium bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="mr-2 h-4 w-4 text-green-500" />
        ) : (
          <Copy className="mr-2 h-4 w-4" />
        )}
        {copied ? "Copied" : "Copy citation"}
      </Button>
    </div>
  );
}
