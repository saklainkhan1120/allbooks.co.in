import { Suspense } from "react";
import { BookGrid } from "@/components/BookGrid";
import { ClientPagination } from "@/components/ClientPagination";
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getNewReleases } from "@/lib/data";

// Enable ISR for new releases page
export const revalidate = 1800; // Revalidate every 30 minutes

interface NewReleasesPageProps {
  searchParams: { page?: string };
}

const NewReleasesContent = async ({ searchParams }: NewReleasesPageProps) => {
  const currentPage = parseInt(searchParams.page || '1');
  const pageLimit = 30;
  
  // Fetch new releases data server-side
  const booksData = await getNewReleases(currentPage, pageLimit);
  
  const books = booksData?.books || [];
  const totalPages = Math.ceil((booksData?.total || 0) / pageLimit);

  return (
    <div className="bg-background">
      <div className="py-12" style={{ background: 'var(--gradient-new-releases)' }}>
        <div className="container mx-auto px-4">
          <div className="mb-4">
            <Breadcrumbs 
              items={[
                { label: 'Home', path: '/' },
                { label: 'New Releases', isCurrent: true }
              ]}
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-center">New Releases</h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Explore the latest books sorted by publication date. Fresh content added regularly.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <BookGrid books={books} loading={false} />
        
        {totalPages > 1 && (
          <ClientPagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/new-releases"
          />
        )}
      </div>
    </div>
  );
};

export const NewReleasesPage = ({ searchParams }: NewReleasesPageProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewReleasesContent searchParams={searchParams} />
    </Suspense>
  );
}; 