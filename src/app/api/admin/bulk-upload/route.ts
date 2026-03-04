import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// Simple in-memory progress store
const uploadProgress = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { books, uploadId } = await request.json();

    if (!books || !Array.isArray(books)) {
      return NextResponse.json(
        { success: false, error: 'Invalid books data' },
        { status: 400 }
      );
    }

    if (!uploadId) {
      return NextResponse.json(
        { success: false, error: 'Upload ID required' },
        { status: 400 }
      );
    }



    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Initialize progress
    uploadProgress.set(uploadId, {
      status: 'processing',
      processed: 0,
      saved: 0,
      errors: 0,
      total: books.length,
      currentBatch: 0,
      totalBatches: Math.ceil(books.length / 20)
    });

    // Process books in smaller batches for better progress tracking
    const batchSize = 100;
    const totalBatches = Math.ceil(books.length / batchSize);
    
    for (let i = 0; i < books.length; i += batchSize) {
      const batch = books.slice(i, i + batchSize);
      const currentBatch = Math.floor(i / batchSize) + 1;
      
      // Update progress
      uploadProgress.set(uploadId, {
        ...uploadProgress.get(uploadId),
        currentBatch,
        processed: i + batch.length
      });
      
      
      
      // Process each book in the batch
      const batchPromises = batch.map(async (bookData, index) => {
        const rowNumber = i + index + 1;
        
        try {
          const { data: result, error } = await db.books.create(bookData);
          
          if (!error) {
            successCount++;
            return { success: true, rowNumber };
          } else {
            errorCount++;
            let errorMessage = '';
            const errorStr = String(error);
            
            if (errorStr.includes('duplicate') || errorStr.includes('unique')) {
              const duplicateInfo = [];
              if (bookData.asin) duplicateInfo.push(`ASIN: ${bookData.asin}`);
              if (bookData.isbn) duplicateInfo.push(`ISBN-13: ${bookData.isbn}`);
              if (bookData.isbn_10) duplicateInfo.push(`ISBN-10: ${bookData.isbn_10}`);
              errorMessage = `${duplicateInfo.join(' or ')} already exists in database`;
            } else if (errorStr.includes('null value')) {
              errorMessage = 'Missing required field (title, author, or genre)';
            } else if (errorStr.includes('invalid input')) {
              errorMessage = 'Invalid data format (check ISBN, ASIN, or date fields)';
            } else {
              errorMessage = errorStr;
            }
            
            return { success: false, rowNumber, error: errorMessage };
          }
        } catch (err) {
          errorCount++;
          const errorMessage = err instanceof Error ? err.message : String(err);
          return { success: false, rowNumber, error: errorMessage };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Update progress after batch completion
      uploadProgress.set(uploadId, {
        ...uploadProgress.get(uploadId),
        saved: successCount,
        errors: errorCount
      });
      
      
    }

    const errors = results.filter(r => !r.success).map(r => `Row ${r.rowNumber}: ${r.error}`);

    // Mark upload as complete
    uploadProgress.set(uploadId, {
      status: 'completed',
      processed: books.length,
      saved: successCount,
      errors: errorCount,
      total: books.length,
      currentBatch: totalBatches,
      totalBatches
    });

    return NextResponse.json({
      success: true,
      data: {
        successCount,
        errorCount,
        totalProcessed: books.length,
        errors
      }
    });

  } catch (error) {
    console.error('Bulk upload API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get('uploadId');
    
    if (!uploadId) {
      return NextResponse.json(
        { success: false, error: 'Upload ID required' },
        { status: 400 }
      );
    }

    const progress = uploadProgress.get(uploadId);
    
    if (!progress) {
      return NextResponse.json(
        { success: false, error: 'Upload not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get progress' },
      { status: 500 }
    );
  }
}
