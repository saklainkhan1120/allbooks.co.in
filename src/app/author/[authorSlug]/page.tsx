import { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthorPage } from '@/components/AuthorPage';
import { getAuthors, getBooksWithFilters } from '@/lib/data';

interface AuthorPageProps {
  params: Promise<{ authorSlug: string }>;
  searchParams: Promise<{ page?: string; genre_filter?: string; language_filter?: string; min_price?: string; max_price?: string; sort_by?: string; sort_order?: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { authorSlug } = await params;
  const decodedAuthor = decodeURIComponent(authorSlug);
  
  return {
    title: `Books by ${decodedAuthor} - Browse by Author - allBooks.co.in`,
    description: `Discover books by ${decodedAuthor} at allBooks.co.in. Browse our collection of literature by ${decodedAuthor}, from classics to contemporary works.`,
    keywords: [decodedAuthor, 'books', 'author', 'literature', 'reading', 'allbooks'],
    openGraph: {
      title: `Books by ${decodedAuthor} - Browse by Author - allBooks.co.in`,
      description: `Discover books by ${decodedAuthor} at allBooks.co.in. Browse our collection of literature by ${decodedAuthor}.`,
      type: 'website',
    },
  };
}

// Pre-generate static pages for popular authors
export async function generateStaticParams() {
  try {
    const authors = await getAuthors();
    
    // Pre-generate pages for top 20 authors (most popular)
    const topAuthors = authors.slice(0, 20);
    
    return topAuthors.map((author: { author: string }) => ({
      authorSlug: encodeURIComponent(author.author),
    }));
  } catch (error) {
    console.error('Error generating static params for authors:', error);
    // Fallback to most common authors
    return [
      { authorSlug: 'Stephen King' },
      { authorSlug: 'J.K. Rowling' },
      { authorSlug: 'Dan Brown' },
      { authorSlug: 'Agatha Christie' },
      { authorSlug: 'William Shakespeare' },
      { authorSlug: 'Jane Austen' },
      { authorSlug: 'Charles Dickens' },
      { authorSlug: 'Mark Twain' },
      { authorSlug: 'Ernest Hemingway' },
      { authorSlug: 'F. Scott Fitzgerald' },
    ];
  }
}

// Enable ISR for author pages
export const revalidate = 1800; // Revalidate every 30 minutes

export default async function Author({ params, searchParams }: AuthorPageProps) {
  const { authorSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const decodedAuthor = decodeURIComponent(authorSlug);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthorPage 
        authorSlug={decodedAuthor} 
        searchParams={resolvedSearchParams} 
      />
    </Suspense>
  );
} 