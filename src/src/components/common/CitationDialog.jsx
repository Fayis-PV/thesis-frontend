import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { CITATION_STYLES } from "@/lib/citations";

export default function CitationDialog({ thesis, open, onOpenChange }) {
  const [active, setActive] = useState("apa");
  const [copied, setCopied] = useState(false);

  if (!thesis) return null;
  const current = CITATION_STYLES.find((c) => c.id === active);
  const text = current.generate(thesis);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Citation copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy citation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate citation</DialogTitle>
          <DialogDescription>{thesis.title}</DialogDescription>
        </DialogHeader>
        <Tabs value={active} onValueChange={setActive}>
          <TabsList className="w-full justify-start">
            {CITATION_STYLES.map((c) => (
              <TabsTrigger key={c.id} value={c.id}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {CITATION_STYLES.map((c) => (
            <TabsContent key={c.id} value={c.id}>
              <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg border bg-muted/40 p-4 font-mono text-sm leading-relaxed text-foreground">
                {c.generate(thesis)}
              </pre>
            </TabsContent>
          ))}
        </Tabs>
        <div className="flex justify-end">
          <Button onClick={copy} variant={copied ? "secondary" : "default"}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy citation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
