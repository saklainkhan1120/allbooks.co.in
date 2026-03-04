export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
  ) {
  const { id } = await params;
  try {



    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Book identifier is required' },
        { status: 400 }
      );
    }

    let result;

    // Check if the parameter looks like a UUID (database ID)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUUID) {
      // Fetch book by database ID (for admin edit)
      
      result = await db.books.getById(id);
    } else {
      // Fetch book by ASIN (for public pages)
      
      result = await db.books.getByASIN(id);
    }

    

    if (result.error) {
      console.error('Database error:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    if (!result.data) {
      
      return NextResponse.json(
        { success: false, error: 'Book not found' },
        { status: 404 }
      );
    }

    

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}
