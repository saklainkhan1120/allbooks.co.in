import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { asin, isbn, isbn_10, excludeId } = await request.json();

    // Check for duplicates using our database interface
    const result = await db.books.checkMultipleExisting(
      asin ? [asin] : undefined,
      isbn ? [isbn] : undefined,
      isbn_10 ? [isbn_10] : undefined
    );

    if (result.error) {
      return NextResponse.json(
        { success: false, error: 'Failed to check duplicates' },
        { status: 500 }
      );
    }

    // Filter out the current book if editing
    const duplicates = result.data?.filter(book => book.id !== excludeId) || [];
    const hasDuplicates = duplicates.length > 0;

    return NextResponse.json({
      success: true,
      hasDuplicates,
      duplicates
    });

  } catch (error) {
    console.error('Error checking duplicates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check duplicates' },
      { status: 500 }
    );
  }
}
