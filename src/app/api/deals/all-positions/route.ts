export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    const result = await db.deals.getAllPositions();

    if (result.error) {
      return NextResponse.json(
        { success: false, error: 'Failed to get positions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error getting positions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get positions' },
      { status: 500 }
    );
  }
}
