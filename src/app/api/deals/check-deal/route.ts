import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const asin = searchParams.get('asin');

    if (!asin) {
      return NextResponse.json(
        { success: false, error: 'ASIN is required' },
        { status: 400 }
      );
    }

    // Check if deal exists
    const existingDeal = await db.deals.checkExisting(asin);

    return NextResponse.json({
      success: true,
      data: existingDeal.data && existingDeal.data.length > 0 ? existingDeal.data[0] : null
    });

  } catch (error) {
    console.error('Error checking deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check deal' },
      { status: 500 }
    );
  }
}
