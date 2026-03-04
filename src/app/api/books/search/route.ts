export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { unstable_cache } from 'next/cache';

// Helper function to convert BigInt and Decimal for JSON serialization
const convertBigIntAndDecimal = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (typeof obj === 'object' && obj.constructor.name === 'Decimal') return Number(obj);
  if (Array.isArray(obj)) return obj.map(convertBigIntAndDecimal);
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertBigIntAndDecimal(obj[key]);
    }
    return converted;
  }
  return obj;
};

// Cached search function
const cachedSearch = unstable_cache(
  async (searchTerm: string, sortBy: string, sortOrder: string, page: number, limit: number) => {
    try {
      const offset = (page - 1) * limit;
      
      // Use searchSimple for now since the RPC function has parameter mismatch
      const result = await db.books.searchSimple(searchTerm, page, limit);
      
      if (result.error) {
        console.error('Search error:', result.error);
        return { success: false, error: result.error, data: [], total: 0 };
      }
      
      // Convert data for proper serialization
      const books = result.data?.map((book: any) => convertBigIntAndDecimal(book)) || [];
      
      return { 
        success: true, 
        data: books, 
        total: books.length 
      };
    } catch (error) {
      console.error('Search API error:', error);
      return { success: false, error: 'Search failed', data: [], total: 0 };
    }
  },
  ['book-search'],
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ['book-search']
  }
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search_term');
    const sortBy = searchParams.get('sort_by') || 'relevance';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');

    if (!searchTerm || searchTerm.trim() === '') {
      return NextResponse.json({
        success: false,
        error: 'Search term is required',
        data: [],
        total: 0
      }, { status: 400 });
    }

    const result = await cachedSearch(searchTerm, sortBy, sortOrder, page, limit);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Search failed', data: [], total: 0 },
      { status: 500 }
    );
  }
}
