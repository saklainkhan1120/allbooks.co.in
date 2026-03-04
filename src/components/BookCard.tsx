'use client';

import { Book } from "@/types/book";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import Link from "next/link";

import { generateBookLink } from '@/lib/utils';

interface BookCardProps {
  book: Book;
  className?: string;
}

export const BookCard = ({ book, className = "" }: BookCardProps) => {
  const isCompact = className.includes('compact');

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 bg-white border-gray-200 hover:border-gray-300 h-full flex flex-col ${className}`}>
      <CardContent className={`${isCompact ? "p-2" : "p-3"} flex flex-col h-full`}>
        <Link href={generateBookLink({ title: book.title || '', author: book.author || '', isbn: book.isbn, asin: book.asin })} className="block flex-1 flex flex-col">
          <div className={`aspect-[3/4] ${isCompact ? "mb-2" : "mb-3"} overflow-hidden rounded-lg bg-white shadow-sm flex-shrink-0 relative`}>
            <img
              src={book.cover_image_url || '/placeholder.svg'}
              alt={book.title || 'Book cover'}
              className="w-full h-full object-contain bg-white group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            {book.selling_price_inr && book.inr_price && book.selling_price_inr < book.inr_price && (
              <Badge className="absolute top-1 right-1 bg-red-500 text-white text-xs">
                {Math.round(100 * (1 - book.selling_price_inr / book.inr_price))}% OFF
              </Badge>
            )}
          </div>
          
          <div className="flex-1 flex flex-col">
            <h3 className={`font-medium ${isCompact ? "text-xs" : "text-sm"} leading-tight line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors ${isCompact ? "mb-1" : "mb-1"} flex-shrink-0`}>
              {book.title}
            </h3>
            
            {(book.author || book.second_author_narrator || book.author_3) && (
              <p className={`${isCompact ? "text-xs" : "text-sm"} text-gray-600 ${isCompact ? "mb-1" : "mb-2"} line-clamp-1 flex-shrink-0`}>
                by {[
                  book.author && <span key="author1" className="text-gray-600">{book.author}</span>,
                  book.second_author_narrator && <span key="author2" className="text-gray-600">{book.author ? ', ' : ''}{book.second_author_narrator}</span>,
                  book.author_3 && <span key="author3" className="text-gray-600">{(book.author || book.second_author_narrator) ? ', ' : ''}{book.author_3}</span>
                ].filter(Boolean)}
              </p>
            )}
          </div>
        </Link>
        
        <div className="flex items-center justify-between mt-auto">
          {/* New INR pricing logic */}
          {book.selling_price_inr && book.inr_price && book.selling_price_inr < book.inr_price ? (
            <span className={`${isCompact ? "text-xs" : "text-sm"} font-semibold text-gray-900`}>
              ₹{book.selling_price_inr}
              <span className="ml-2 text-gray-500 line-through">₹{book.inr_price}</span>
              <span className="ml-1 text-green-700 font-semibold">({Math.round(100 * (1 - book.selling_price_inr / book.inr_price))}% off)</span>
            </span>
          ) : book.selling_price_inr ? (
            <span className={`${isCompact ? "text-xs" : "text-sm"} font-semibold text-gray-900`}>
              ₹{book.selling_price_inr}
            </span>
          ) : book.inr_price ? (
            <span className={`${isCompact ? "text-xs" : "text-sm"} font-semibold text-gray-900`}>
              ₹{book.inr_price}
            </span>
          ) : null}
          {book.best_seller_rank && (
            <div className="flex items-center gap-1">
              <Star className={`${isCompact ? "h-2.5 w-2.5" : "h-3 w-3"} fill-amber-400 text-amber-400`} />
              <span className={`${isCompact ? "text-xs" : "text-xs"} text-gray-500`}>#{book.best_seller_rank}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 