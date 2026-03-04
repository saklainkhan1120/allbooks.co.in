import { Suspense } from "react";
import { BookGrid } from "@/components/BookGrid";
import { ClientPagination } from "@/components/ClientPagination";
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getBestsellers } from "@/lib/data";

// Enable ISR for bestsellers page
export const revalidate = 1800; // Revalidate every 30 minutes

interface BestsellersPageProps {
  searchParams: { page?: string };
}

const BestsellersContent = async ({ searchParams }: BestsellersPageProps) => {
  const currentPage = parseInt(searchParams.page || '1');
  const pageLimit = 30;
  
  // Fetch bestsellers data server-side
  const booksData = await getBestsellers(currentPage, pageLimit);
  
  const books = booksData?.books || [];
  const totalPages = Math.ceil((booksData?.total || 0) / pageLimit);

  return (
    <div className="bg-background">
      <div className="py-12" style={{ background: 'var(--gradient-best-sellers)' }}>
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Breadcrumbs 
              items={[
                { label: 'Home', path: '/' },
                { label: 'Bestsellers', isCurrent: true }
              ]}
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">Best Sellers</h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Discover the most popular and best-selling books that readers love.
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <BookGrid books={books} loading={false} />
        {totalPages > 1 && (
          <ClientPagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/bestsellers"
          />
        )}
      </div>
    </div>
  );
};

export const BestsellersPage = ({ searchParams }: BestsellersPageProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BestsellersContent searchParams={searchParams} />
    </Suspense>
  );
}; 