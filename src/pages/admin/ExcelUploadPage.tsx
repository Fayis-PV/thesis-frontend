import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Info,
} from "lucide-react";
import { useThesisMutations } from "@/features/theses/hooks/useThesisMutations";

export default function ExcelUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const { uploadExcelMutation } = useThesisMutations();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (
      dropped &&
      (dropped.name.endsWith(".xlsx") || dropped.name.endsWith(".xls"))
    ) {
      setFile(dropped);
      setErrorList([]);
      setSuccessCount(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setErrorList([]);
    setSuccessCount(null);

    try {
      const res = await uploadExcelMutation.mutateAsync(file);
      const responsePayload = res as {
        data?: { errors?: string[]; successfully_created?: number };
        errors?: string[];
      };
      const responseData = responsePayload.data || responsePayload;

      const errors = responseData.errors ?? [];
      if (errors.length > 0) {
        setErrorList(errors);
      } else {
        setSuccessCount(responsePayload.data?.successfully_created ?? 0);
      }
    } catch (error: unknown) {
      const err = error as { errors?: string[]; message?: string };
      setErrorList(err.errors || [err.message || "Failed to upload file"]);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 py-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Bulk Import</h2>
        <p className="text-muted-foreground mt-1">
          Upload thesis records directly via an Excel spreadsheet.
        </p>
      </div>

      <Card className="bg-primary/10 border-primary/20 shadow-none">
        <CardContent className="pt-6 flex gap-4">
          <Info className="text-primary flex-shrink-0" />
          <div className="text-sm text-foreground space-y-2">
            <p className="font-semibold">Required Columns:</p>
            <p className="font-mono bg-background/80 py-1 px-2 rounded border border-border">
              Title, Abstract, Author
            </p>
            <p className="font-semibold mt-2">Optional Columns:</p>
            <p className="font-mono bg-background/80 py-1 px-2 rounded border border-border">
              Supervisor, Institution Code, Department Code, Keywords
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-xs bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileSpreadsheet className="text-primary" /> Select File
          </CardTitle>
          <CardDescription>Drag and drop your .xlsx file here.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById("excelFile")?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
                dragOver
                  ? "border-primary bg-primary/10"
                  : file
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-border hover:bg-muted/40 hover:border-primary/40"
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <FileSpreadsheet
                    size={48}
                    className="text-emerald-500 mb-2"
                  />
                  <p className="font-semibold text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud size={48} className="text-muted-foreground mb-4" />
                  <p className="font-medium text-foreground">
                    Click to browse or drag file here
                  </p>
                </div>
              )}
            </div>

            <input
              id="excelFile"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) {
                  setFile(e.target.files[0]);
                  setErrorList([]);
                  setSuccessCount(null);
                }
              }}
            />

            {successCount !== null && (
              <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <div>
                  Successfully imported <strong>{successCount}</strong> theses.{" "}
                  <Link
                    to="/admin/theses"
                    className="underline font-medium ml-2 text-primary"
                  >
                    View all theses →
                  </Link>
                </div>
              </div>
            )}

            {errorList.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <h4 className="font-semibold text-destructive flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 mr-2" /> Upload Failed
                </h4>
                <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                  {errorList.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-base"
              disabled={uploadExcelMutation.isPending || !file}
            >
              {uploadExcelMutation.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <UploadCloud className="mr-2 h-5 w-5" />
              )}
              {uploadExcelMutation.isPending
                ? "Processing via Django..."
                : "Upload & Import Database"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
