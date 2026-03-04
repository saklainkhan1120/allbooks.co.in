export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await db.deals.update(id, { is_top_six: true });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: 'Failed to set as top six' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error setting as top six:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set as top six' },
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
    const result = await db.deals.update(id, { is_top_six: false });

    if (result.error) {
      return NextResponse.json(
        { success: false, error: 'Failed to remove from top six' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error removing from top six:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove from top six' },
      { status: 500 }
    );
  }
}
