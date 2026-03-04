'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateBookLink } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';


interface SimilarBook {
  id: string;
  title: string;
  author?: string;
  asin: string;
  cover_image_url?: string;
  inr_price?: number;
  selling_price_inr?: number;
  main_genre?: string;
  publisher?: string;
  similarity_score?: number;
  match_type?: string;
}

interface SimilarBooksProps {
  currentBookId?: string;
  currentBookTitle: string;
  currentBookAuthor?: string;
  currentBookGenre?: string;
  currentBookASIN?: string;
  maxBooks?: number;
}

export const SimilarBooks: React.FC<SimilarBooksProps> = ({ 
  currentBookId,
  currentBookTitle, 
  currentBookAuthor, 
  currentBookGenre,
  currentBookASIN,
  maxBooks = 18 
}) => {
  const [similarBooks, setSimilarBooks] = useState<SimilarBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchSimilarBooks = async () => {
      if (!currentBookTitle && !currentBookId) return;

      setIsLoading(true);
      setError(null);

      try {

        
        // Use our local API route
        
        const params = new URLSearchParams();
        if (currentBookId) params.append('currentBookId', currentBookId);
        if (currentBookTitle) params.append('currentTitle', currentBookTitle);
        if (currentBookAuthor) params.append('currentAuthor', currentBookAuthor);
        if (currentBookGenre) params.append('currentGenre', currentBookGenre);
        if (currentBookASIN) params.append('currentASIN', currentBookASIN);
        params.append('maxResults', maxBooks.toString());
        
        const response = await fetch(`/api/similar-books?${params.toString()}`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch similar books');
        }
        
        const data = result.data;
        const searchError = null;



        if (searchError) {
          console.error('Error fetching similar books:', searchError);
          setError('Failed to load similar books');
          return;
        }

        if (!data) {
          setSimilarBooks([]);
          return;
        }



        // Use the data directly from database function
        const filteredBooks = Array.isArray(data) ? data as SimilarBook[] : [];

        setSimilarBooks(filteredBooks);
      } catch (err) {
        console.error('Error in fetchSimilarBooks:', err);
        setError('Failed to load similar books');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilarBooks();
  }, [currentBookId, currentBookTitle, currentBookAuthor, currentBookGenre, currentBookASIN, maxBooks]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gray-600" />
          <div className="text-xl font-semibold text-gray-900">Similar Books</div>
        </div>
        
        <div className="relative">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-44">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-3 w-3/4 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gray-600" />
          <div className="text-xl font-semibold text-gray-900">Similar Books</div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (similarBooks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gray-600" />
          <div className="text-xl font-semibold text-gray-900">Similar Books</div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">No similar books found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900">Similar Books</h2>
      </div>
      
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide"
        >
          {similarBooks.map((book) => (
            <SimilarBookCard key={book.id} book={book} />
          ))}
        </div>
        
        {/* Navigation arrows */}
        <Button
          onClick={scrollLeft}
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white border-gray-200 hover:bg-gray-50 shadow-md"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={scrollRight}
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white border-gray-200 hover:bg-gray-50 shadow-md"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface SimilarBookCardProps {
  book: SimilarBook;
}

const SimilarBookCard: React.FC<SimilarBookCardProps> = ({ book }) => {
  const discount = book.selling_price_inr && book.inr_price 
    ? Math.round(((book.inr_price - book.selling_price_inr) / book.inr_price) * 100)
    : null;

  return (
    <Card className="w-44 flex-shrink-0 group hover:shadow-lg transition-all duration-200 bg-white border-gray-200 hover:border-gray-300 h-full flex flex-col">
      <CardContent className="p-2 sm:p-3 flex flex-col h-full">
        <Link 
          href={generateBookLink({ title: book.title, author: book.author || '', asin: book.asin })}
          className="block flex-1 flex flex-col"
        >
          {/* Cover Image */}
          <div className="aspect-[3/4] mb-2 sm:mb-3 overflow-hidden rounded-lg bg-white shadow-sm flex-shrink-0 relative">
            <img
              src={book.cover_image_url || '/placeholder.svg'}
              alt={book.title}
              className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            {discount && (
              <Badge className="absolute top-1 right-1 bg-red-500 text-white text-xs">
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 flex flex-col min-h-0">
            <h3 className="font-medium text-xs sm:text-sm leading-tight line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors mb-1 flex-shrink-0">
              {book.title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-1 flex-shrink-0">
              {book.author && (
                <span className="text-blue-600">
                  {book.author}
                </span>
              )}
            </p>
          </div>
        </Link>
        
        {/* Price */}
        <div className="flex items-center justify-between mt-auto">
          {book.selling_price_inr && book.inr_price && book.selling_price_inr < book.inr_price ? (
            <div className="text-xs sm:text-sm">
              <span className="font-semibold text-gray-900">
                ₹{book.selling_price_inr}
              </span>
              <span className="ml-1 text-gray-500 line-through">₹{book.inr_price}</span>
              <span className="ml-1 text-green-700 font-semibold">({Math.round(100 * (1 - book.selling_price_inr / book.inr_price))}% off)</span>
            </div>
          ) : book.selling_price_inr ? (
            <span className="text-xs sm:text-sm font-semibold text-gray-900">
              ₹{book.selling_price_inr}
            </span>
          ) : book.inr_price ? (
            <span className="text-xs sm:text-sm font-semibold text-gray-900">
              ₹{book.inr_price}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}; 