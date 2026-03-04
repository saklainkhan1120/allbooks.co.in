import { Metadata } from 'next';
import { Suspense } from 'react';
import { PublisherPage } from '@/components/PublisherPage';
import { getPublishers, getBooksWithFilters } from '@/lib/data';

interface PublisherPageProps {
  params: Promise<{ publisher: string }>;
  searchParams: Promise<{ page?: string; genre_filter?: string; language_filter?: string; min_price?: string; max_price?: string; sort_by?: string; sort_order?: string }>;
}

export async function generateMetadata({ params }: PublisherPageProps): Promise<Metadata> {
  const { publisher } = await params;
  const decodedPublisher = decodeURIComponent(publisher);
  
  return {
    title: `${decodedPublisher} Books - Browse by Publisher - allBooks.co.in`,
    description: `Discover books by ${decodedPublisher} at allBooks.co.in. Browse our collection of books published by ${decodedPublisher}.`,
    keywords: [decodedPublisher, 'books', 'publisher', 'publishing', 'reading', 'allbooks'],
    openGraph: {
      title: `${decodedPublisher} Books - Browse by Publisher - allBooks.co.in`,
      description: `Discover books by ${decodedPublisher} at allBooks.co.in. Browse our collection of books published by ${decodedPublisher}.`,
      type: 'website',
    },
  };
}

// Pre-generate static pages for popular publishers
export async function generateStaticParams() {
  try {
    const { publishers } = await getPublishers(1, 20);
    
    // Pre-generate pages for top 20 publishers (most popular)
    return publishers.map((publisher: { publisher: string }) => ({
      publisher: encodeURIComponent(publisher.publisher),
    }));
  } catch (error) {
    console.error('Error generating static params for publishers:', error);
    // Fallback to most common publishers
    return [
      { publisher: 'Penguin Random House' },
      { publisher: 'HarperCollins' },
      { publisher: 'Simon & Schuster' },
      { publisher: 'Hachette Book Group' },
      { publisher: 'Macmillan Publishers' },
      { publisher: 'Scholastic' },
      { publisher: 'Bloomsbury' },
      { publisher: 'Oxford University Press' },
      { publisher: 'Cambridge University Press' },
      { publisher: 'Wiley' },
    ];
  }
}

// Enable ISR for publisher pages
export const revalidate = 1800; // Revalidate every 30 minutes

export default async function Publisher({ params, searchParams }: PublisherPageProps) {
  const { publisher } = await params;
  const resolvedSearchParams = await searchParams;
  const decodedPublisher = decodeURIComponent(publisher);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublisherPage 
        publisherSlug={decodedPublisher} 
        searchParams={resolvedSearchParams} 
      />
    </Suspense>
  );
} 