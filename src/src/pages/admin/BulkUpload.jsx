import React, { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Download,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/common/PageHeader";
import { uploadApi } from "@/api/uploadApi";

const ACCEPT = [".xlsx", ".xls"];
const MAX_SIZE = 10 * 1024 * 1024;

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: ({ file }) => uploadApi.uploadExcel(file, setProgress),
    onSuccess: (data) => {
      setResult(data);
      toast.success("Upload processed");
    },
    onError: (e) => {
      setError(e.message);
      toast.error(e.message);
    },
  });

  const validate = (f) => {
    setError("");
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!ACCEPT.includes(ext)) {
      setError("Only .xlsx and .xls files are accepted.");
      return false;
    }
    if (f.size > MAX_SIZE) {
      setError("File exceeds 10MB limit.");
      return false;
    }
    return true;
  };

  const handleFile = useCallback((f) => {
    if (!validate(f)) return;
    setFile(f);
    setResult(null);
    setProgress(0);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onUpload = () => {
    if (!file) return;
    setResult(null);
    setProgress(0);
    setError("");
    mutation.mutate({ file });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk upload"
        description="Import multiple theses from an Excel spreadsheet."
      />

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
        <Info className="mr-1.5 inline h-4 w-4 align-text-bottom" />
        Bulk upload is processed atomically by the backend — if validation
        fails, no records are committed.
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 text-center transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30"
            }`}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <UploadCloud className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium">Drag & drop your Excel file here</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supports .xlsx and .xls up to 10MB
            </p>
            <label className="mt-4 cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />
              <span className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Browse files
              </span>
            </label>
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          {file && (
            <div className="mt-5 flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button onClick={onUpload} disabled={mutation.isPending}>
                {mutation.isPending ? "Processing…" : "Upload & process"}
              </Button>
            </div>
          )}

          {mutation.isPending && (
            <div className="mt-4 space-y-1">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                {progress}% processed
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <Stat label="Total rows" value={result.totalRows} />
            <Stat
              label="Successful"
              value={result.successful}
              tone="text-emerald-600"
            />
            <Stat
              label="Failed"
              value={result.failed}
              tone="text-destructive"
            />
            <Stat
              label="Errors"
              value={result.errorCount}
              tone="text-amber-600"
            />
          </div>

          {result.errors.length > 0 && (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Row-level errors</CardTitle>
                  <CardDescription>
                    Correct these rows and re-upload
                  </CardDescription>
                </div>
                {result.errorReportUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={result.errorReportUrl} download>
                      <Download className="h-4 w-4" /> Error report
                    </a>
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Field</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Suggestion
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.errors.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell>{e.row}</TableCell>
                        <TableCell className="font-medium">{e.field}</TableCell>
                        <TableCell className="text-destructive">
                          {e.error}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {e.suggestion || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-2 font-display text-2xl font-semibold ${tone || ""}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
