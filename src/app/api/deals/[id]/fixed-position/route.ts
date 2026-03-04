export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if we already have 3 fixed position deals
    const statsResult = await db.deals.getStats();
    if (statsResult.data?.fixedPositionDeals >= 3) {
      return NextResponse.json(
        { success: false, error: 'Maximum 3 fixed position deals allowed' },
        { status: 429 }
      );
    }

    const result = await db.deals.update(id, { is_fixed_position: true });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: 'Failed to set as fixed position' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error setting as fixed position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set as fixed position' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await db.deals.update(id, { is_fixed_position: false });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: 'Failed to remove from fixed position' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error removing from fixed position:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove from fixed position' },
      { status: 500 }
    );
  }
}
