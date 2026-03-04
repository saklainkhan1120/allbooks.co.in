import { Metadata } from "next";
import { PublishersPage } from "@/components/PublishersPage";
import { getPublishers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Browse Books by Publisher - allBooks.co.in",
  description: "Discover books by your favorite publishers at allBooks.co.in. Browse our extensive collection of publishers from established houses to independent presses. Find books by publisher name.",
  keywords: ['publishers', 'books by publisher', 'publisher search', 'publishing house', 'books', 'literature', 'allbooks'],
  openGraph: {
    title: "Browse Books by Publisher - allBooks.co.in",
    description: "Discover books by your favorite publishers at allBooks.co.in. Browse our extensive collection of publishers from established houses to independent presses.",
    type: 'website',
  },
};

// Enable ISR for publishers page
export const revalidate = 3600; // Revalidate every hour (publishers don't change often)

export default async function Publishers({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const searchTerm = params.search || '';
  const page = parseInt(params.page || '1');
  
  // Fetch publishers data server-side
  const publishersData = await getPublishers(page, 30, searchTerm);
  
  return <PublishersPage publishersData={publishersData} currentPage={page} searchTerm={searchTerm} />;
} 