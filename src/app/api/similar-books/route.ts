export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentBookId = searchParams.get('currentBookId') ?? undefined;
    const currentTitle = searchParams.get('currentTitle') ?? undefined;
    const currentAuthor = searchParams.get('currentAuthor') ?? undefined;
    const currentGenre = searchParams.get('currentGenre') ?? undefined;
    const currentASIN = searchParams.get('currentASIN') ?? undefined;
    const maxResults = parseInt(searchParams.get('maxResults') || '18', 10);

    if (!currentBookId && !currentTitle && !currentAuthor && !currentGenre && !currentASIN) {
      return NextResponse.json(
        { success: false, error: 'At least one search parameter is required' },
        { status: 400 }
      );
    }

    const { data, error } = await db.books.getSimilar(
      currentBookId,
      currentTitle,
      currentAuthor,
      currentGenre,
      currentASIN,
      maxResults
    );

    if (error) {
      return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error('Error fetching similar books:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Failed to fetch similar books' },
      { status: 500 }
    );
  }
}
