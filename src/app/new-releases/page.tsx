import { Metadata } from "next";
import { NewReleasesPage } from "@/components/NewReleasesPage";

export const metadata: Metadata = {
  title: "New Book Releases - Latest Books - allBooks.co.in",
  description: "Discover the latest new book releases at allBooks.co.in. Browse recently published books sorted by publication date. Fresh content added regularly.",
  keywords: ['new releases', 'latest books', 'recent publications', 'new books', 'just published', 'books', 'allbooks'],
  openGraph: {
    title: "New Book Releases - Latest Books",
    description: "Discover the latest new book releases at allBooks.co.in. Browse recently published books sorted by publication date.",
    type: 'website',
  },
};

// Enable ISR for new releases page - optimized for freshness
export const revalidate = 900; // Revalidate every 15 minutes (new releases change frequently)

interface NewReleasesPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NewReleases({ searchParams }: NewReleasesPageProps) {
  const resolvedSearchParams = await searchParams;
  return <NewReleasesPage searchParams={resolvedSearchParams} />;
} 