import { Metadata } from "next";
import { DailyDealsPage } from '@/components/DailyDealsPage';

export const metadata: Metadata = {
  title: "Daily Deals - Limited Time Book Offers - allBooks.co.in",
  description: "Discover amazing daily deals on books at allBooks.co.in. Limited-time offers with great discounts on popular titles.",
  keywords: ['daily deals', 'book deals', 'discounts', 'limited time offers', 'sale', 'books', 'allbooks'],
  openGraph: {
    title: "Daily Deals - Limited Time Book Offers",
    description: "Discover amazing daily deals on books at allBooks.co.in. Limited-time offers with great discounts on popular titles.",
    type: 'website',
  },
};

// Enable ISR for daily deals page - optimized for daily changes
export const revalidate = 1800; // Revalidate every 30 minutes (deals change daily)

interface DailyDealsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function DailyDeals({ searchParams }: DailyDealsPageProps) {
  const resolvedSearchParams = await searchParams;
  return <DailyDealsPage searchParams={resolvedSearchParams} />;
} 