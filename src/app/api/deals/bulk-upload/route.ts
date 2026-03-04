import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { asins } = await request.json();

    if (!asins || !Array.isArray(asins)) {
      return NextResponse.json(
        { success: false, error: 'ASINs array is required' },
        { status: 400 }
      );
    }

    // Get current max position (like backup app)
    const maxPositionData = await prisma.daily_deals.findFirst({
      orderBy: { position: 'desc' },
      select: { position: true }
    });
    
    let currentPosition = (maxPositionData?.position || 0) + 1;

    // Check which ASINs already exist (like backup app)
    const existingDeals = await prisma.daily_deals.findMany({
      where: { asin: { in: asins } },
      select: { asin: true }
    });

    const existingAsins = new Set(existingDeals.map(deal => deal.asin));
    const validAsins: string[] = [];
    const invalidAsins: string[] = [];

    for (const asin of asins) {
      try {
        // Validate ASIN format (like backup app)
        if (asin.length !== 10 || !/^[A-Z0-9]{10}$/.test(asin)) {
          invalidAsins.push(asin);
          continue;
        }

        // Check if already exists (like backup app)
        if (existingAsins.has(asin)) {
          invalidAsins.push(asin);
          continue;
        }

        // Check if book exists in database
        const bookExists = await prisma.books.findFirst({
          where: { asin }
        });

        if (!bookExists) {
          invalidAsins.push(asin);
          continue;
        }

        // Add deal (like backup app)
        await prisma.daily_deals.create({
          data: {
            asin,
            position: currentPosition++,
            is_top_six: false,
            is_fixed_position: false
          }
        });

        validAsins.push(asin);
      } catch (error) {
        console.error(`Error adding deal for ASIN ${asin}:`, error);
        invalidAsins.push(asin);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalCount: asins.length,
        validCount: validAsins.length,
        error: invalidAsins.length > 0 ? new Error(`Failed to add ${invalidAsins.length} ASINs.`) : undefined
      }
    });

  } catch (error) {
    console.error('Error bulk uploading ASINs to deals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to bulk upload ASINs' },
      { status: 500 }
    );
  }
}
