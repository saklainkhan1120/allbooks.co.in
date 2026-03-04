import { Suspense } from "react";
import { BookGrid } from "@/components/BookGrid";
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getJustListed } from "@/lib/data";
import { ClientPagination } from "@/components/ClientPagination";

// Enable ISR for just listed page
export const revalidate = 1800; // Revalidate every 30 minutes

interface JustListedPageProps {
  searchParams: { page?: string };
}

const JustListedContent = async ({ searchParams }: JustListedPageProps) => {
  const currentPage = parseInt(searchParams.page || '1');
  const pageLimit = 30;
  
  // Fetch just listed data server-side
  const booksData = await getJustListed(currentPage, pageLimit);
  
  const books = booksData?.books || [];
  const totalPages = Math.ceil((booksData?.total || 0) / pageLimit);

  return (
    <div className="bg-background">
      <div className="py-12" style={{ background: 'var(--gradient-just-listed)' }}>
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Breadcrumbs 
              items={[
                { label: 'Home', path: '/' },
                { label: 'Just Listed', isCurrent: true }
              ]}
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">Just Listed</h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Discover books that have been recently added to our catalog. Fresh additions updated regularly.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <BookGrid books={books} loading={false} />
        
        {totalPages > 1 && (
          <ClientPagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/just-listed"
          />
        )}
      </div>
    </div>
  );
};

export const JustListedPage = ({ searchParams }: JustListedPageProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JustListedContent searchParams={searchParams} />
    </Suspense>
  );
}; 