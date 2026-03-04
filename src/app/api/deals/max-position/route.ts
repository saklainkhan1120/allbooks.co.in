import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    const result = await db.deals.getMaxPosition();

    if (result.error) {
      return NextResponse.json(
        { success: false, error: 'Failed to get max position' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error getting max position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get max position' },
      { status: 500 }
    );
  }
}
