import { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { APIResponse } from "@/types/api";
import { useThesisMutations } from "../hooks/useThesisMutations";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ThesisExcelUploadModal = ({ isOpen, onClose }: Props) => {
  const [file, setFile] = useState<File | null>(null);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadExcelMutation } = useThesisMutations();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setServerErrors([]);
      setSuccessMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setServerErrors([]);
    setSuccessMessage(null);

    try {
      const response = (await uploadExcelMutation.mutateAsync(
        file,
      )) as unknown as APIResponse;
      setSuccessMessage(response.message || "Theses successfully uploaded.");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: unknown) {
      const err = error as { message?: string; errors?: string[] };
      // Django might return a list of specific row errors in err.errors
      if (err.errors && err.errors.length > 0) {
        setServerErrors(err.errors);
      } else {
        setServerErrors([err.message || "An error occurred during upload."]);
      }
    }
  };

  const handleClose = () => {
    setFile(null);
    setServerErrors([]);
    setSuccessMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Bulk Upload Theses
          </h3>
          <button
            onClick={handleClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success State */}
        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="space-y-6">
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 transition-colors hover:bg-gray-100"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="h-10 w-10 text-blue-600" />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 cursor-pointer">
                <UploadCloud className="h-10 w-10 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">
                  Click to select an Excel file
                </p>
                <p className="text-xs text-gray-500">
                  .xlsx or .xls files only
                </p>
              </div>
            )}
          </div>

          {/* Error List */}
          {serverErrors.length > 0 && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200 max-h-40 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <h4 className="text-sm font-medium text-red-800">
                  Upload Errors:
                </h4>
              </div>
              <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                {serverErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              onClick={handleClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploadExcelMutation.isPending}
              className="flex items-center justify-center rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {uploadExcelMutation.isPending ? "Uploading..." : "Upload Excel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
