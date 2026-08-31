import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, UploadCloud, AlertCircle } from "lucide-react";
import { useThesisMutations } from "@/features/theses/hooks/useThesisMutations";

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: () => void;
}

export default function ExcelUploadModal({
  isOpen,
  onOpenChange,
  onUploadComplete,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [errorList, setErrorList] = useState<string[]>([]);
  const { uploadExcelMutation } = useThesisMutations();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFile(null);
      setErrorList([]);
    }
    onOpenChange(open);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setErrorList([]);

    try {
      const res = await uploadExcelMutation.mutateAsync(file);
      // Safely check if Axios returned nested objects based on your specific backend parsing setup
      const responsePayload = res as {
        data?: { errors?: string[] };
        errors?: string[];
      };
      const responseData = responsePayload.data || responsePayload;
      const errors = responseData.errors ?? [];
      if (errors.length > 0) {
        setErrorList(errors);
      } else {
        onUploadComplete();
      }
    } catch (error: unknown) {
      const err = error as { errors?: string[]; message?: string };
      setErrorList(err.errors || [err.message || "Failed to upload file"]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Bulk Upload Theses</DialogTitle>
            <DialogDescription>
              Select an .xlsx or .xls file to import records directly to
              PostgreSQL.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Select Excel File</Label>
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={uploadExcelMutation.isPending}
                required
              />
            </div>

            {errorList.length > 0 && (
              <div className="pt-4 space-y-2 max-h-40 overflow-y-auto">
                <h4 className="font-semibold text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" /> Import Errors
                </h4>
                <ul className="list-disc list-inside bg-red-50 border border-red-100 p-3 rounded-md text-sm text-red-700">
                  {errorList.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter className="mt-8">
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={uploadExcelMutation.isPending || !file}
            >
              {uploadExcelMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-4 w-4" />
              )}
              {uploadExcelMutation.isPending
                ? "Processing via Django..."
                : "Upload and Process"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
