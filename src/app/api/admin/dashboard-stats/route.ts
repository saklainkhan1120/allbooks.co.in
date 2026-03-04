import { NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    // Get all dashboard stats
    const [
      totalBooksResult,
      todayUploadsResult,
      authorsResult,
      categoriesResult,
      publishersResult,
      dealsStatsResult
    ] = await Promise.all([
      db.bookManagement.getTotalCount(),
      db.bookManagement.getTodayUploadCount(),
      db.bookManagement.getUniqueAuthors(),
      db.bookManagement.getUniqueGenres(),
      db.bookManagement.getUniquePublishers(),
      db.deals.getStats()
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalBooks: totalBooksResult.data || 0,
        todayUploads: todayUploadsResult.count || 0,
        uniqueAuthors: authorsResult.data?.length || 0,
        uniqueCategories: categoriesResult.data?.length || 0,
        uniquePublishers: publishersResult.data?.length || 0,
        totalDeals: dealsStatsResult.data?.totalDeals || 0,
        topSixDeals: dealsStatsResult.data?.topSixDeals || 0,
        fixedPositionDeals: dealsStatsResult.data?.fixedPositionDeals || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
