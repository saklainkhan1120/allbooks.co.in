import { Book } from "@/types/book";
import { BookCard } from "./BookCard";

interface BookGridProps {
  books: Book[];
  loading?: boolean;
  className?: string;
  compact?: boolean;
  sidebar?: boolean;
}

export const BookGrid = ({ 
  books, 
  loading, 
  className = "", 
  compact = false, 
  sidebar = false 
}: BookGridProps) => {
  if (loading) {
    return (
      <div className={`grid ${sidebar ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'} gap-4 ${className}`}>
        {Array.from({ length: sidebar ? 8 : 12 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-lg shadow-sm"></div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No books found.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${sidebar ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'} gap-4 ${className}`}>
      {books.map((book, index) => {
        // Create a unique key combining multiple identifiers
        const uniqueKey = `${book.id || 'no-id'}-${book.asin || 'no-asin'}-${index}`;
        return (
          <BookCard key={uniqueKey} book={book} className={compact ? "compact" : ""} />
        );
      })}
    </div>
  );
}; 