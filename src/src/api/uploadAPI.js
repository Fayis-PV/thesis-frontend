/** Upload API — bulk Excel ingestion. */
import { mockRequest } from "./mockRequest";

export const uploadApi = {
  /**
   * @param {File} file
   * @param {(progress:number)=>void} [onProgress]
   * Real endpoint: POST /theses/bulk_upload/ (multipart/form-data)
   */
  async uploadExcel(file, onProgress) {
    return mockRequest(
      () => {
        // simulate progress
        [10, 35, 60, 85, 100].forEach((p, i) =>
          setTimeout(() => onProgress?.(p), i * 120),
        );
        return {
          totalRows: 24,
          successful: 21,
          failed: 3,
          errorCount: 3,
          errors: [
            {
              row: 4,
              field: "publication_date",
              error: "Invalid date format",
              suggestion: "Use YYYY-MM-DD",
            },
            {
              row: 11,
              field: "department",
              error: "Department not found for institution MIT",
              suggestion: "Create department first",
            },
            {
              row: 19,
              field: "title",
              error: "Title is required",
              suggestion: "Provide a non-empty title",
            },
          ],
          errorReportUrl: "#",
        };
      },
      { latency: 900 },
    );
  },
};
