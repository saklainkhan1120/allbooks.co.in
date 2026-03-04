'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateBookLink } from '@/lib/utils';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Gift } from 'lucide-react';

interface DailyDealBook {
  id: string;
  asin: string;
  title: string;
  author: string;
  cover_image_url: string;
  main_genre: string;
  inr_price: number;
  selling_price_inr: number;
  position: number;
  is_top_six: boolean;
  is_fixed_position: boolean;
  discount_percentage?: number;
  original_price?: number;
  deal_price?: number;
}

interface DailyDealsProps {
  bookASIN?: string;
}

export const DailyDeals: React.FC<DailyDealsProps> = ({ bookASIN }) => {
  const [dailyDeals, setDailyDeals] = useState<DailyDealBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carousel scroll logic - moved to top to follow Rules of Hooks
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchDailyDeals = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (bookASIN) {
          // Try book-specific deals first (like backup app)
          try {
            const response = await fetch(`/api/daily-deals?bookASIN=${encodeURIComponent(bookASIN)}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.deals && data.deals.length > 0) {
                setDailyDeals(data.deals);
                return;
              }
            }
          } catch (apiError) {
            console.error('Book-specific deals API call failed:', apiError);
          }
          
          // If no book-specific deals found, fallback to all deals (excluding current book)
          await fetchFallbackDeals();
        } else {
          // For homepage, get all deals
          await fetchFallbackDeals();
        }
      } catch (err) {
        console.error('Error in fetchDailyDeals:', err);
        // Don't set error for empty deals - just show empty state
        setDailyDeals([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFallbackDeals = async () => {
      try {
        // Get all daily deals from our local database (like backup app)
        const response = await fetch('/api/daily-deals');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.deals && data.deals.length > 0) {
            // Filter out the current book if provided (like backup app)
            const filteredDeals = bookASIN 
              ? data.deals.filter((deal: DailyDealBook) => deal.asin !== bookASIN)
              : data.deals;
            setDailyDeals(filteredDeals);
            return;
          }
        }

        // If no deals found, show empty state
    
        setDailyDeals([]);
      } catch (err) {
        console.error('Error in fetchFallbackDeals:', err);
        // Don't set error for fallback issues - just show empty state
        setDailyDeals([]);
      }
    };

    fetchDailyDeals();
  }, [bookASIN]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Daily Deals</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="aspect-[3/4] w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || dailyDeals.length === 0) {
    return null; // Don't show anything if no deals or error
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Daily Deals</h2>
        <Link href="/daily-deals" className="text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap">
          View All
        </Link>
      </div>
      
      {/* Scrollable Layout */}
      <div className="relative">
        <div 
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide"
        >
          {dailyDeals.map((book) => (
            <div key={book.id} className="flex-shrink-0 w-44">
              <DailyDealCard book={book} />
            </div>
          ))}
        </div>
        
        {/* Navigation arrows */}
        <button
          onClick={() => scrollBy(-300)}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white border-gray-200 hover:bg-gray-50 shadow-md rounded-full p-2"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button
          onClick={() => scrollBy(300)}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white border-gray-200 hover:bg-gray-50 shadow-md rounded-full p-2"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    </div>
  );
};

interface DailyDealCardProps {
  book: DailyDealBook;
}

const DailyDealCard: React.FC<DailyDealCardProps> = ({ book }) => {
  const discount = book.selling_price_inr && book.inr_price 
    ? Math.round(((book.inr_price - book.selling_price_inr) / book.inr_price) * 100)
    : null;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-white border-gray-200 hover:border-gray-300 h-full flex flex-col">
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
                <span className="text-gray-600">
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