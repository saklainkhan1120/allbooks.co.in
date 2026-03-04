export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

// Helper function to convert BigInt and Decimal values
function convertBigIntAndDecimal(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (typeof obj === 'object') {
    // Handle Decimal objects (Prisma Decimal type)
    if (obj.constructor.name === 'Decimal' || (obj.s !== undefined && obj.e !== undefined && obj.d !== undefined)) {
      return Number(obj);
    }
    
    // Handle Date objects
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(convertBigIntAndDecimal);
    }
    
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntAndDecimal(value);
    }
    return converted;
  }
  
  return obj;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters from query string
    const genre_filter = searchParams.get('genre_filter') || undefined;
    const author_filter = searchParams.get('author_filter') || undefined;
    const publisher_filter = searchParams.get('publisher_filter') || undefined;
    const subject_filter = searchParams.get('subject_filter') || undefined;
    const tag_filter = searchParams.get('tag_filter') || undefined;
    const language_filter = searchParams.get('language_filter') || undefined;
    const min_price = searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined;
    const max_price = searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined;
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 30;

    const filters = {
      genre_filter,
      author_filter,
      publisher_filter,
      subject_filter,
      tag_filter,
      language_filter,
      min_price,
      max_price,
      sort_by,
      sort_order,
      page_offset: (page - 1) * limit,
      page_limit: limit
    };

    console.log('API: Calling db.books.filter with:', filters);

    const result = await db.books.filter(filters);

    if (result.error) {
      console.error('API: Database error:', result.error);
      return NextResponse.json(
        { error: 'Failed to fetch books', details: result.error },
        { status: 500 }
      );
    }

    // Convert BigInt and Decimal values for JSON serialization
    const books = result.data || [];
    const processedBooks = books.map(convertBigIntAndDecimal);
    
    // Extract total count from the first book's total_count field
    const total = books.length > 0 && books[0]?.total_count 
      ? Number(books[0].total_count) 
      : books.length;

    console.log(`API: Returning ${processedBooks.length} books, total: ${total}`);

    return NextResponse.json({
      books: processedBooks,
      total,
      page,
      limit
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
