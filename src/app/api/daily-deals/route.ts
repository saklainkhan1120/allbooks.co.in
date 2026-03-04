import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookASIN = searchParams.get('bookASIN');

    // Get all daily deals using direct Prisma query
    const dealsData = await prisma.daily_deals.findMany({
      orderBy: [
        { is_fixed_position: 'desc' },
        { position: 'asc' }
      ],
      take: 18
    });

    // Get book data for each deal
    const dealsWithBookData = await Promise.all(
      dealsData.map(async (deal) => {
        const bookData = await prisma.books.findFirst({
          where: { asin: deal.asin },
          select: {
            title: true,
            author: true,
            cover_image_url: true,
            inr_price: true,
            selling_price_inr: true,
            main_genre: true
          }
        });

        return {
          id: deal.id,
          asin: deal.asin,
          title: bookData?.title || 'Unknown Title',
          author: bookData?.author,
          cover_image_url: bookData?.cover_image_url,
          main_genre: bookData?.main_genre,
          inr_price: bookData?.inr_price,
          selling_price_inr: bookData?.selling_price_inr,
          position: deal.position,
          is_top_six: deal.is_top_six,
          is_fixed_position: deal.is_fixed_position
        };
      })
    );

    // Filter out the current book if provided
    const filteredDeals = bookASIN 
      ? dealsWithBookData.filter(deal => deal.asin !== bookASIN)
      : dealsWithBookData;

    return NextResponse.json({
      success: true,
      deals: filteredDeals
    });

  } catch (error) {
    console.error('Error fetching daily deals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch daily deals' },
      { status: 500 }
    );
  }
}
