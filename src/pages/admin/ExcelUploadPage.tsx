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
        <h2 className="text-3xl font-bold text-gray-900">Bulk Import</h2>
        <p className="text-gray-500 mt-1">
          Upload thesis records directly via an Excel spreadsheet.
        </p>
      </div>

      <Card className="bg-blue-50 border-blue-100 shadow-none">
        <CardContent className="pt-6 flex gap-4">
          <Info className="text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-900 space-y-2">
            <p className="font-semibold">Required Columns:</p>
            <p className="font-mono bg-white/50 py-1 px-2 rounded">
              Title, Abstract, Author
            </p>
            <p className="font-semibold mt-2">Optional Columns:</p>
            <p className="font-mono bg-white/50 py-1 px-2 rounded">
              Supervisor, Institution Code, Department Code, Keywords
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="text-blue-600" /> Select File
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
                  ? "border-blue-500 bg-blue-50"
                  : file
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <FileSpreadsheet
                    size={48}
                    className="text-emerald-600 mb-2"
                  />
                  <p className="font-semibold text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud size={48} className="text-gray-400 mb-4" />
                  <p className="font-medium text-gray-900">
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
              <div className="flex items-start gap-2 rounded-md border bg-emerald-50 p-4 text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                <div>
                  Successfully imported <strong>{successCount}</strong> theses.{" "}
                  <Link
                    to="/admin/theses"
                    className="underline font-medium ml-2"
                  >
                    View all theses →
                  </Link>
                </div>
              </div>
            )}

            {errorList.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 mr-2" /> Upload Failed
                </h4>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {errorList.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base"
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
