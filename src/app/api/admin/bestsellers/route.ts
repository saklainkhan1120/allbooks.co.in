import { NextRequest, NextResponse } from 'next/server';
import { getBestsellerBooks, addBestseller, removeBestseller, bulkAddBestsellers } from '@/lib/bestsellers';

// GET - Fetch bestseller management data
export async function GET() {
  try {
    const result = await getBestsellerBooks();
    
    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to fetch bestseller data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      books: result.data || [],
      total: result.data?.length || 0
    });
  } catch (error) {
    console.error('Error fetching bestseller management data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bestseller data' },
      { status: 500 }
    );
  }
}

// POST - Add bestseller(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { asin, asins, action } = body;

    if (action === 'add-single' && asin) {
      const result = await addBestseller(asin);
      return NextResponse.json({
        success: !result.error,
        data: result.data,
        error: result.error?.message
      });
    }

    if (action === 'add-bulk' && asins && Array.isArray(asins)) {
      const results = await bulkAddBestsellers(asins);
      return NextResponse.json({ 
        success: true,
        results: results.errors.map(error => ({ success: false, error }))
      });
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error adding bestseller:', error);
    return NextResponse.json(
      { error: 'Failed to add bestseller' },
      { status: 500 }
    );
  }
}

// DELETE - Remove bestseller
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const asin = searchParams.get('asin');

    if (!asin) {
      return NextResponse.json(
        { error: 'ASIN parameter is required' },
        { status: 400 }
      );
    }

    const result = await removeBestseller(asin);
    return NextResponse.json({
      success: !result.error,
      error: result.error?.message
    });
  } catch (error) {
    console.error('Error removing bestseller:', error);
    return NextResponse.json(
      { error: 'Failed to remove bestseller' },
      { status: 500 }
    );
  }
} 