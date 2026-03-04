import { Metadata } from 'next';
import { KeywordPage } from '@/components/KeywordPage';

interface KeywordPageProps {
  params: Promise<{ keyword: string }>;
}

export async function generateMetadata({ params }: KeywordPageProps): Promise<Metadata> {
  const { keyword } = await params;
  const decodedKeyword = decodeURIComponent(keyword);
  
  return {
    title: `${decodedKeyword} Books - Search Results - allBooks.co.in`,
    description: `Search results for books containing "${decodedKeyword}" at allBooks.co.in. Find books related to ${decodedKeyword}.`,
    keywords: [decodedKeyword, 'books', 'search', 'keyword', 'reading', 'allbooks'],
    openGraph: {
      title: `${decodedKeyword} Books - Search Results - allBooks.co.in`,
      description: `Search results for books containing "${decodedKeyword}" at allBooks.co.in.`,
      type: 'website',
    },
  };
}

// Enable ISR for keyword pages
export const revalidate = 1800; // Revalidate every 30 minutes

export default function Keyword({ params }: KeywordPageProps) {
  return <KeywordPage keyword={params} />;
} 