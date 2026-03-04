import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    const result = await db.deals.getStats();

    if (result.error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch deals stats' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: result.data
    });

  } catch (error) {
    console.error('Error fetching deals stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deals stats' },
      { status: 500 }
    );
  }
}
