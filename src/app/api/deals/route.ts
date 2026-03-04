import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all daily deals (like backup app)
    const dealsData = await prisma.daily_deals.findMany({
      orderBy: { position: 'asc' }
    });

    // Get book data for each ASIN (like backup app)
    const dealsWithBookData = await Promise.all(
      dealsData.map(async (deal) => {
        const bookData = await prisma.books.findFirst({
          where: { asin: deal.asin },
          select: {
            title: true,
            author: true,
            cover_image_url: true,
            inr_price: true
          }
        });

        return {
          id: deal.id,
          asin: deal.asin,
          title: bookData?.title || 'Unknown Title',
          author: bookData?.author,
          cover_image_url: bookData?.cover_image_url,
          inr_price: bookData?.inr_price,
          position: deal.position,
          is_fixed_position: deal.is_fixed_position,
          is_top_six: deal.is_top_six,
          created_at: deal.created_at
        };
      })
    );

    return NextResponse.json(dealsWithBookData);

  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const dealData = await request.json();
    
    const result = await prisma.daily_deals.create({
      data: dealData
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
