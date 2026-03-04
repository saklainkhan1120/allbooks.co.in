'use client';

import { Book } from "@/types/book";
import { BookCard } from "./BookCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";

interface BookCarouselProps {
  books: Book[];
  loading?: boolean;
  className?: string;
  scrollRef?: React.RefObject<HTMLDivElement>;
  hideArrows?: boolean;
  viewAllHref?: string;
  title?: string;
}

export const BookCarousel = ({ books, loading, className = "", scrollRef, hideArrows, viewAllHref, title }: BookCarouselProps) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const refToUse = scrollRef || internalRef;

  const scroll = (direction: 'left' | 'right') => {
    if (refToUse.current) {
      const scrollAmount = 300;
      const newScrollLeft = refToUse.current.scrollLeft + 
        (direction === 'right' ? scrollAmount : -scrollAmount);
      refToUse.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-44 animate-pulse">
              <div className="bg-muted h-64 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <div className={`${className} relative`}>
      {!hideArrows && (
        <div className="flex items-center justify-between mb-6">
          {title && <h2 className="text-2xl font-bold text-gray-900">{title}</h2>}
          <div className="flex items-center gap-3">
            {viewAllHref && (
              <Link href={viewAllHref} className="text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap">
                View All
              </Link>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="h-10 w-10 rounded-full !bg-white !border-gray-200 hover:!bg-gray-50 shadow-sm"
            >
              <ChevronLeft className="h-5 w-5 !text-gray-500" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="h-10 w-10 rounded-full !bg-white !border-gray-200 hover:!bg-gray-50 shadow-sm"
            >
              <ChevronRight className="h-5 w-5 !text-gray-500" />
            </Button>
          </div>
        </div>
      )}
      <div 
        ref={refToUse}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {books.map((book, index) => {
          // Create a unique key combining multiple identifiers
          const uniqueKey = `${book.id || 'no-id'}-${book.asin || 'no-asin'}-${index}`;
          return (
            <div key={uniqueKey} className="flex-shrink-0 w-44">
              <BookCard book={book} className="compact" />
            </div>
          );
        })}
      </div>
    </div>
  );
}; 