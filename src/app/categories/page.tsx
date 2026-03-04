import { Metadata } from "next";
import { CategoriesPage } from "@/components/CategoriesPage";

export const metadata: Metadata = {
  title: "Book Categories - Browse by Genre - allBooks.co.in",
  description: "Explore books by category at allBooks.co.in. Browse our comprehensive collection organized by genre, subject, and more.",
  keywords: ['book categories', 'genres', 'browse books', 'book genres', 'categories', 'books', 'allbooks'],
  openGraph: {
    title: "Book Categories - Browse by Genre",
    description: "Explore books by category at allBooks.co.in. Browse our comprehensive collection organized by genre, subject, and more.",
    type: 'website',
  },
};

// Enable ISR for categories page
export const revalidate = 1800; // Revalidate every 30 minutes

interface CategoriesPageProps {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>;
}

export default async function Categories({ searchParams }: CategoriesPageProps) {
  const resolvedSearchParams = await searchParams;
  return <CategoriesPage searchParams={resolvedSearchParams} />;
} 