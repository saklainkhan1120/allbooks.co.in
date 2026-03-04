export interface CSVData {
  [key: string]: string;
}

export interface ParsedBook {
  data: any | null;
  originalData: any; // Always preserve original row data
  errors: string[];
  rowNumber: number;
}

export interface ExcelData {
  [key: string]: any;
}

export interface UploadProgress {
  processed: number;  // Books sent to database
  saved: number;      // Books actually saved to database
  skipped: number;    // Books that failed validation
  total: number;      // Total books in file
  currentBatch: number;
  totalBatches: number;
  status: 'idle' | 'uploading' | 'complete' | 'error';
}

export interface UploadResults {
  successCount: number;
  errorCount: number;
  validationErrors: string[];
  databaseErrors: string[];
  totalProcessed: number;
  totalSkipped: number;
}

export interface ResumeData {
  fileName: string;
  totalRows: number;
  completedBatches: number[];
  validRows: any[];
  timestamp: number;
}

// New interfaces for Phase 1 features
export interface ValidationSummary {
  totalBooks: number;
  validBooks: number;
  invalidBooks: number;
  errorCategories: {
    missingFields: number;
    invalidFormats: number;
    duplicates: number;
    databaseDuplicates: number;
  };
  errorsByRow: { [rowNumber: number]: string[] };
}

export interface FailedBookExport {
  originalData: any;
  errors: string[];
  rowNumber: number;
}

export interface PreviewValidationProps {
  parsedData: ParsedBook[];
  onUpload: () => void;
  onExportFailed: () => void;
  onCancel: () => void;
}

export interface ExportFailedBooksProps {
  failedBooks: FailedBookExport[];
  fileName: string;
} 