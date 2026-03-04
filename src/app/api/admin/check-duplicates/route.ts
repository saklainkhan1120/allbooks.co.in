import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { asins, isbns, isbn10s } = await request.json();

    if (!asins && !isbns && !isbn10s) {
      return NextResponse.json(
        { success: false, error: 'No identifiers provided' },
        { status: 400 }
      );
    }

    const duplicates: { asin?: string[], isbn?: string[], isbn_10?: string[] } = {};

    // Check all duplicates at once
    const existingBooks = await db.books.checkMultipleExisting(asins, isbns, isbn10s);
    
    if (existingBooks.data && existingBooks.data.length > 0) {
      // Group duplicates by type
      const existingAsins = existingBooks.data.map(book => book.asin).filter((asin): asin is string => asin !== null);
      const existingIsbns = existingBooks.data.map(book => book.isbn).filter((isbn): isbn is string => isbn !== null);
      const existingIsbn10s = existingBooks.data.map(book => book.isbn_10).filter((isbn_10): isbn_10 is string => isbn_10 !== null);
      
      if (existingAsins.length > 0) duplicates.asin = existingAsins;
      if (existingIsbns.length > 0) duplicates.isbn = existingIsbns;
      if (existingIsbn10s.length > 0) duplicates.isbn_10 = existingIsbn10s;
    }

    return NextResponse.json({
      success: true,
      duplicates
    });

  } catch (error) {
    console.error('Check duplicates API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
