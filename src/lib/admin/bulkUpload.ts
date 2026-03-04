import { ParsedBook, UploadProgress, UploadResults, ResumeData } from './types';

// Save progress to localStorage (optimized for large datasets)
export const saveUploadProgress = (fileName: string, totalRows: number, completedBatches: number[], validRows: any[]) => {
  try {
    // For large datasets, only save essential progress data
    const progressData = {
      fileName,
      totalRows,
      completedBatches,
      // Only save row numbers and minimal data for large datasets
      validRowNumbers: validRows.map(row => row.rowNumber),
      timestamp: Date.now()
    };
    localStorage.setItem('bookUploadProgress', JSON.stringify(progressData));
  } catch (error) {
    console.warn('Failed to save progress to localStorage:', error);
  }
};

// Load progress from localStorage
export const loadUploadProgress = (): ResumeData | null => {
  try {
    const saved = localStorage.getItem('bookUploadProgress');
    if (saved) {
      const data = JSON.parse(saved);
      // Check if it's from the last 24 hours
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Failed to load progress from localStorage:', error);
  }
  return null;
};

// Clear progress
export const clearUploadProgress = () => {
  localStorage.removeItem('bookUploadProgress');
};

// Main upload function - OPTIMIZED FOR SPEED
export const handleUploadConfirm = async (
  parsedData: ParsedBook[],
  resumeFromProgress = false,
  resumeData?: ResumeData,
  onProgress?: (progress: UploadProgress) => void,
  onComplete?: (results: UploadResults) => void
) => {
  console.log('Starting bulk upload process...');
  
  // Separate valid and invalid rows
  const validRows = parsedData.filter(row => row.data && row.errors.length === 0);
  const invalidRows = parsedData.filter(row => !row.data || row.errors.length > 0);
  
  console.log(`Processing ${validRows.length} valid books, ${invalidRows.length} invalid books`);
  
  if (validRows.length === 0) {
    console.log('No valid books to upload');
    onComplete?.({
      successCount: 0,
      errorCount: 0,
      validationErrors: invalidRows.map(row => `Row ${row.rowNumber}: ${row.errors.join(', ')}`),
      databaseErrors: [],
      totalProcessed: 0,
      totalSkipped: invalidRows.length
    });
    return;
  }

  // Extract book data for API call
  const booksToUpload = validRows.map(row => row.data!);
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`Sending ${booksToUpload.length} books to API for upload (ID: ${uploadId})...`);
    
    // Start progress polling
    let progressInterval: NodeJS.Timeout | undefined;
    
    const startProgressPolling = () => {
      progressInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/admin/bulk-upload?uploadId=${uploadId}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.progress) {
              const progress = result.progress;
              onProgress?.({
                processed: progress.processed,
                saved: progress.saved,
                skipped: invalidRows.length,
                total: parsedData.length,
                currentBatch: progress.currentBatch,
                totalBatches: progress.totalBatches,
                status: progress.status === 'completed' ? 'complete' : 'uploading'
              });
              
              // Stop polling if upload is complete
              if (progress.status === 'completed') {
                if (progressInterval) {
                  clearInterval(progressInterval);
                }
              }
            }
          }
        } catch (error) {
          console.error('Progress polling error:', error);
        }
      }, 1000); // Poll every second
    };
    
    // Start polling immediately
    startProgressPolling();
    
    // Call the API route for bulk upload
    const response = await fetch('/api/admin/bulk-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ books: booksToUpload, uploadId }),
    });

    const result = await response.json();
    
    // Stop polling
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    if (!result.success) {
      throw new Error(result.error || 'Bulk upload failed');
    }

    const { successCount, errorCount, totalProcessed, errors } = result.data;
    
    console.log(`Upload completed: ${successCount} books saved, ${errorCount} errors`);
    
    onComplete?.({
      successCount,
      errorCount: errorCount + invalidRows.length,
      validationErrors: invalidRows.map(row => `Row ${row.rowNumber}: ${row.errors.join(', ')}`),
      databaseErrors: errors,
      totalProcessed,
      totalSkipped: invalidRows.length
    });
    
  } catch (error) {
    console.error('Upload failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    onComplete?.({
      successCount: 0,
      errorCount: validRows.length + invalidRows.length,
      validationErrors: invalidRows.map(row => `Row ${row.rowNumber}: ${row.errors.join(', ')}`),
      databaseErrors: [`Upload failed: ${errorMessage}`],
      totalProcessed: validRows.length,
      totalSkipped: invalidRows.length
    });
    throw error;
  }
}; 