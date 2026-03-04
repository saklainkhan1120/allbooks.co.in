import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookDetailPage } from "@/components/BookDetailPage";
import { getBook } from "@/lib/data";
import { Book } from "@/types/book";

interface BookDetailPageProps {
  params: Promise<{ bookSlug: string; authorSlug: string; isbn: string; asin?: string }>;
}

export async function generateMetadata({ params }: BookDetailPageProps): Promise<Metadata> {
  const { bookSlug, authorSlug, isbn, asin } = await params;
  
  try {
    // Try to get book by ISBN first, then by ASIN if available
    let book = await getBook(isbn);
    
    if (!book && asin) {
      book = await getBook(asin);
    }
    
    if (!book) {
      return {
        title: "Book Not Found - allBooks.co.in",
        description: "The requested book could not be found.",
      };
    }

    // Generate the correct title format
    const bookIdentifier = book.isbn || book.asin || isbn || asin || '';
    const identifierType = book.isbn ? 'ISBN' : 'ASIN';
    const title = `${book.title} by ${book.author} | Book ${identifierType} ${bookIdentifier} | allBooks.co.in`;

    return {
      title,
      description: book.description?.substring(0, 160) || `Discover ${book.title} by ${book.author}. Read reviews, compare prices, and find the best deals.`,
      openGraph: {
        title: `${book.title} by ${book.author}`,
        description: book.description?.substring(0, 160) || `Discover ${book.title} by ${book.author}`,
        images: book.cover_image_url ? [{ url: book.cover_image_url }] : [],
        type: 'book',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${book.title} by ${book.author}`,
        description: book.description?.substring(0, 160) || `Discover ${book.title} by ${book.author}`,
        images: book.cover_image_url ? [book.cover_image_url] : [],
      },
    };
  } catch (error) {
    return {
      title: "Book Not Found - allBooks.co.in",
      description: "The requested book could not be found.",
    };
  }
}

// Enable ISR for book detail pages
export const revalidate = 3600; // Revalidate every hour

export default async function BookDetailPageWrapper({ params }: BookDetailPageProps) {
  const { bookSlug, authorSlug, isbn, asin } = await params;
  
  try {
    // Try to get book by ISBN first, then by ASIN if available
    let book = await getBook(isbn);
    
    if (!book && asin) {
      book = await getBook(asin);
    }
    
    if (!book) {
      notFound();
    }

    return <BookDetailPage book={book as Book} />;
  } catch {
    notFound();
  }
} 