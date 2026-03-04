import { Metadata } from "next";
import { BestsellersPage } from "@/components/BestsellersPage";

export const metadata: Metadata = {
  title: "Best Selling Books - Popular Books - allBooks.co.in",
  description: "Discover the most popular and best-selling books at allBooks.co.in. Browse top-rated books that readers love and recommend.",
  keywords: ['bestsellers', 'popular books', 'top books', 'best selling books', 'trending books', 'books', 'allbooks'],
  openGraph: {
    title: "Best Selling Books - Popular Books",
    description: "Discover the most popular and best-selling books at allBooks.co.in. Browse top-rated books that readers love.",
    type: 'website',
  },
};

// Enable ISR for bestsellers page - optimized for stability
export const revalidate = 3600; // Revalidate every hour (bestsellers are more stable)

interface BestsellersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Bestsellers({ searchParams }: BestsellersPageProps) {
  const resolvedSearchParams = await searchParams;
  return <BestsellersPage searchParams={resolvedSearchParams} />;
} 