import { Metadata } from 'next';
import { Suspense } from 'react';
import { GenrePage } from '@/components/GenrePage';
import { getGenres, getBooksWithFilters } from '@/lib/data';

interface GenrePageProps {
  params: Promise<{ genre: string }>;
  searchParams: Promise<{ page?: string; author_filter?: string; language_filter?: string; min_price?: string; max_price?: string; sort_by?: string; sort_order?: string }>;
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { genre } = await params;
  const decodedGenre = decodeURIComponent(genre);
  
  return {
    title: `${decodedGenre} Books - Browse by Genre - allBooks.co.in`,
    description: `Discover ${decodedGenre} books at allBooks.co.in. Browse our collection of ${decodedGenre} literature, from classics to contemporary works.`,
    keywords: [decodedGenre, 'books', 'literature', 'genre', 'reading', 'allbooks'],
    openGraph: {
      title: `${decodedGenre} Books - Browse by Genre - allBooks.co.in`,
      description: `Discover ${decodedGenre} books at allBooks.co.in. Browse our collection of ${decodedGenre} literature.`,
      type: 'website',
    },
  };
}

// Pre-generate static pages for popular genres
export async function generateStaticParams() {
  try {
    const genres = await getGenres();
    
    // Pre-generate pages for top 20 genres (most popular)
    const topGenres = genres.slice(0, 20);
    
    return topGenres.map((genre: { category: string }) => ({
      genre: encodeURIComponent(genre.category || ''),
    }));
  } catch (error) {
    console.error('Error generating static params for genres:', error);
    // Fallback to most common genres
    return [
      { genre: 'Fiction' },
      { genre: 'Non-Fiction' },
      { genre: 'Science Fiction' },
      { genre: 'Romance' },
      { genre: 'Mystery' },
      { genre: 'Thriller' },
      { genre: 'Biography' },
      { genre: 'History' },
      { genre: 'Self-Help' },
      { genre: 'Children\'s Fiction' },
    ];
  }
}

// Enable ISR for genre pages
export const revalidate = 1800; // Revalidate every 30 minutes

export default async function Genre({ params, searchParams }: GenrePageProps) {
  const { genre } = await params;
  const resolvedSearchParams = await searchParams;
  const decodedGenre = decodeURIComponent(genre);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GenrePage 
        genreSlug={decodedGenre} 
        searchParams={resolvedSearchParams} 
      />
    </Suspense>
  );
} 