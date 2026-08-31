import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  FileWarning,
} from "lucide-react";

export default function PdfViewer({
  pdfUrl,
  title,
  onDownload,
}: {
  pdfUrl: string;
  title?: string;
  onDownload?: () => void;
}) {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);

  // =========================================================================
  // URL FORMATTER: Automatically converts Google Drive /view links to /preview
  // so they can bypass Google's iframe security blocks.
  // =========================================================================
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("drive.google.com")) {
      return url.replace(/\/view.*$/, "/preview");
    }
    // For standard PDFs, append toolbar=0 to hide default browser controls
    return `${url}#toolbar=0`;
  };

  const embedUrl = getEmbedUrl(pdfUrl);

  if (!pdfUrl)
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 h-full">
        <FileWarning className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          No Document Available
        </h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md text-center">
          The PDF document for this thesis is not available. Please contact the
          administrator.
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 h-full">
        <FileWarning className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">
          Unable to Load Preview
        </h3>
        <p className="text-sm text-gray-500 mt-2 mb-4 text-center">
          There was an error rendering the document in the browser.
        </p>
        {onDownload && (
          <Button onClick={onDownload} className="bg-blue-600">
            <Download className="mr-2 h-4 w-4" /> Download PDF Instead
          </Button>
        )}
      </div>
    );

  return (
    <div
      className={`flex flex-col h-full ${isFullscreen ? "fixed inset-0 z-[100] bg-white" : ""}`}
    >
      <div className="flex justify-between p-3 bg-gray-100 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
          {title}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.max(z - 25, 50))}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-gray-500 w-12 text-center leading-8">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.min(z + 25, 200))}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-2 mt-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          {isFullscreen && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="ml-2"
            >
              Close
            </Button>
          )}
        </div>
      </div>
      <div className="relative bg-gray-200 overflow-auto flex-1 min-h-[600px]">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            width: `${100 * (100 / zoom)}%`,
            height: "100%",
          }}
        >
          <iframe
            src={embedUrl}
            className="w-full h-full min-h-[800px] border-0"
            onError={() => setError(true)}
            allow="autoplay"
          />
        </div>
      </div>
    </div>
  );
}
