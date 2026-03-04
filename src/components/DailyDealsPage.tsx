import { Suspense } from 'react';
import { ClientPagination } from '@/components/ClientPagination';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BookGrid } from '@/components/BookGrid';
import { getDailyDealsPage } from '@/lib/data';
import { Book } from '@/types/book';

import { DailyDealBook } from '@/lib/data';

// Enable ISR for daily deals page
export const revalidate = 1800; // Revalidate every 30 minutes

const DAILY_DEALS_PAGE_SIZE = 30;

interface DailyDealsPageProps {
  searchParams: { page?: string };
}

const DailyDealsContent = async ({ searchParams }: DailyDealsPageProps) => {
  const currentPage = parseInt(searchParams.page || '1');
  
  // Fetch daily deals data server-side
  const deals = await getDailyDealsPage();
  const totalCount = deals.length;

  // Convert DailyDealBook to Book type for BookGrid
  const books: Book[] = deals.map((deal: any) => ({
    id: deal.id,
    title: deal.title,
    author: deal.author || '',
    asin: deal.asin,
    cover_image_url: deal.cover_image_url || '',
    inr_price: deal.inr_price || 0, // Original price
    selling_price_inr: deal.selling_price_inr || undefined, // Discounted price (undefined if no discount)
    usd_price: (deal as any).usd_price || 0,
    main_genre: deal.main_genre || '',
    publisher: (deal as any).publisher || '',
    created_at: deal.created_at,
    updated_at: deal.created_at,
    status: 'active'
  }));

  const totalPages = Math.ceil(totalCount / DAILY_DEALS_PAGE_SIZE);

  return (
    <div className="bg-background">
      <div className="py-12" style={{ background: 'var(--gradient-daily-deals)' }}>
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Breadcrumbs 
              items={[
                { label: 'Home', path: '/' },
                { label: 'Daily Deals', isCurrent: true }
              ]}
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">Daily Deals</h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Discover amazing deals on books with limited-time offers. Fresh deals added daily.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {books.length > 0 ? (
          <>
            <BookGrid books={books} loading={false} />
            
            {totalPages > 1 && (
              <ClientPagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/daily-deals"
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No Deals Available</h3>
            <p className="text-muted-foreground">
              Check back later for new daily deals!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const DailyDealsPage = ({ searchParams }: DailyDealsPageProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DailyDealsContent searchParams={searchParams} />
    </Suspense>
  );
}; 