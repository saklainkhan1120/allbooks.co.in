import { Metadata } from 'next';
import { Suspense } from 'react';
import { SubjectPage } from '@/components/SubjectPage';
import { getBooksWithFilters } from '@/lib/data';

interface SubjectPageProps {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ page?: string; author_filter?: string; language_filter?: string; min_price?: string; max_price?: string; sort_by?: string; sort_order?: string }>;
}

export async function generateMetadata({ params }: SubjectPageProps): Promise<Metadata> {
  const { subject } = await params;
  const decodedSubject = decodeURIComponent(subject);
  
  return {
    title: `${decodedSubject} Books - Browse by Subject - allBooks.co.in`,
    description: `Discover ${decodedSubject} books at allBooks.co.in. Browse our collection of books on ${decodedSubject} topics.`,
    keywords: [decodedSubject, 'books', 'subject', 'topic', 'reading', 'allbooks'],
    openGraph: {
      title: `${decodedSubject} Books - Browse by Subject - allBooks.co.in`,
      description: `Discover ${decodedSubject} books at allBooks.co.in. Browse our collection of books on ${decodedSubject} topics.`,
      type: 'website',
    },
  };
}

// Enable ISR for subject pages
export const revalidate = 1800; // Revalidate every 30 minutes

export default async function Subject({ params, searchParams }: SubjectPageProps) {
  const { subject } = await params;
  const resolvedSearchParams = await searchParams;
  const decodedSubject = decodeURIComponent(subject);
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubjectPage 
        subjectSlug={decodedSubject} 
        searchParams={resolvedSearchParams} 
      />
    </Suspense>
  );
} 