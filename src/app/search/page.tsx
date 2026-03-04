
import { Metadata } from "next";
import { Suspense } from "react";
import { SearchPage } from "@/components/SearchPage";

export const metadata: Metadata = {
  title: "Search Books - allBooks.co.in",
  description: "Search for books by title, author, genre, and more on allBooks.co.in. Browse our extensive book catalog.",
  keywords: ['search', 'books', 'book search', 'allbooks', 'book catalog'],
  openGraph: {
    title: "Search Books - allBooks.co.in",
    description: "Search for books by title, author, genre, and more on allBooks.co.in. Browse our extensive book catalog.",
    type: "website",
  },
};

// Enable ISR for search page with shorter revalidation since search results can change
export const revalidate = 900; // Revalidate every 15 minutes

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
} 