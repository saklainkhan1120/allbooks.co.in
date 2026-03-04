import { Metadata } from 'next';
import { Suspense } from 'react';
import { TagPage } from '@/components/TagPage';

interface TagPageProps {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string; genre_filter?: string; language_filter?: string; min_price?: string; max_price?: string; sort_by?: string; sort_order?: string }>;
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  return {
    title: `${decodedTag} Books - Browse by Tag - allBooks.co.in`,
    description: `Discover books tagged with ${decodedTag} at allBooks.co.in. Browse our collection of books related to ${decodedTag}.`,
    keywords: [decodedTag, 'books', 'tag', 'topic', 'reading', 'allbooks'],
    openGraph: {
      title: `${decodedTag} Books - Browse by Tag - allBooks.co.in`,
      description: `Discover books tagged with ${decodedTag} at allBooks.co.in. Browse our collection of books related to ${decodedTag}.`,
      type: 'website',
    },
  };
}

// Pre-generate static pages for popular tags
export async function generateStaticParams() {
  // Pre-generate pages for most common tags
  return [
    { tag: 'Bestseller' },
    { tag: 'New Release' },
    { tag: 'Award Winner' },
    { tag: 'Classic' },
    { tag: 'Contemporary' },
    { tag: 'Historical' },
    { tag: 'Romance' },
    { tag: 'Mystery' },
    { tag: 'Thriller' },
    { tag: 'Science Fiction' },
    { tag: 'Fantasy' },
    { tag: 'Biography' },
    { tag: 'Self-Help' },
    { tag: 'Business' },
    { tag: 'Technology' },
    { tag: 'Philosophy' },
    { tag: 'Religion' },
    { tag: 'Children' },
    { tag: 'Young Adult' },
    { tag: 'Academic' },
  ];
}

// Enable ISR for tag pages
export const revalidate = 1800; // Revalidate every 30 minutes

export default async function Tag({ params, searchParams }: TagPageProps) {
  const { tag } = await params;
  const resolvedSearchParams = await searchParams;
  const decodedTag = decodeURIComponent(tag);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TagPage 
        tagSlug={decodedTag} 
        searchParams={resolvedSearchParams} 
      />
    </Suspense>
  );
} 