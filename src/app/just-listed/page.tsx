import { Metadata } from "next";
import { JustListedPage } from "@/components/JustListedPage";

export const metadata: Metadata = {
  title: "Just Listed Books - Recently Added - allBooks.co.in",
  description: "Browse just listed books recently added to allBooks.co.in. Discover newly cataloged books across all genres. Fresh additions updated regularly.",
  keywords: ['just listed', 'recently added', 'new books', 'recent additions', 'books', 'allbooks'],
  openGraph: {
    title: "Just Listed Books - Recently Added",
    description: "Browse just listed books recently added to allBooks.co.in. Discover newly cataloged books across all genres.",
    type: 'website',
  },
};

// Enable ISR for just listed page - optimized for freshness
export const revalidate = 900; // Revalidate every 15 minutes (just listed changes frequently)

interface JustListedPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function JustListed({ searchParams }: JustListedPageProps) {
  const resolvedSearchParams = await searchParams;
  return <JustListedPage searchParams={resolvedSearchParams} />;
} 