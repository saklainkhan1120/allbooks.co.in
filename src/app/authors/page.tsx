import { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthorsPage } from '@/components/AuthorsPage';
import { getAuthors, getBooksWithFilters } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Browse Books by Author - allBooks.co.in',
  description: 'Discover books by your favorite authors at allBooks.co.in. Browse our extensive collection of authors from established writers to emerging voices. Find books by author name.',
  keywords: ['authors', 'books by author', 'author search', 'writer', 'novelist', 'books', 'literature', 'allbooks'],
  openGraph: {
    title: 'Browse Books by Author - allBooks.co.in',
    description: 'Discover books by your favorite authors at allBooks.co.in. Browse our extensive collection of authors from established writers to emerging voices.',
    type: 'website',
  },
};

// Enable ISR for authors page
export const revalidate = 3600; // Revalidate every hour (authors don't change often)

interface AuthorsPageProps {
  searchParams: Promise<{ page?: string; author?: string }>;
}

export default async function Authors({ searchParams }: AuthorsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const selectedAuthor = params.author || null;
  
  // Fetch data server-side
  const authorsData = await getAuthors();
  const booksData = await getBooksWithFilters({
    author_filter: selectedAuthor || undefined,
    page,
    limit: 20
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthorsPage 
        authorsData={authorsData}
        booksData={booksData}
        currentPage={page}
        selectedAuthor={selectedAuthor}
      />
    </Suspense>
  );
} 