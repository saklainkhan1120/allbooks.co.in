export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await db.deals.delete(id);

    if (result.error) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete deal' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete deal' },
      { status: 500 }
    );
  }
}
