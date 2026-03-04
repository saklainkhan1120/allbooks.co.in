'use client';

import { useState, useEffect } from "react";
import { Book } from "@/types/book";

export const BOOKS_PAGE_SIZE = 30;

export interface SearchParams {
  search_term: string;
  sort_by?: 'relevance' | 'title' | 'publication_date' | 'best_seller_rank' | 'created_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult extends Book {
  search_rank?: number;
  match_type?: 'exact_identifier' | 'full_text' | 'keyword_extraction' | 'fuzzy';
}

export const useBookSearch = (params: SearchParams) => {
  const { search_term, sort_by = 'relevance', sort_order = 'desc', page = 1, limit = BOOKS_PAGE_SIZE } = params;
  
  const [data, setData] = useState<{ books: SearchResult[], total: number, matchType: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!search_term || search_term.trim() === '') {
        setData(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const offset = (page - 1) * limit;
        
        // Use our database interface
        const response = await fetch(`/api/books/search?search_term=${encodeURIComponent(search_term)}&sort_by=${sort_by}&sort_order=${sort_order}&page=${page}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Search failed');
        }
        
        const books: SearchResult[] = result.data || [];
        
        // Remove duplicates based on unique identifiers
        const uniqueBooks = books.reduce((acc: SearchResult[], book) => {
          // Create a unique identifier for each book
          const uniqueId = book.id || book.asin || book.isbn || book.isbn_10 || `${book.title}-${book.author}`;
          
          // Check if this book is already in our accumulator
          const exists = acc.find(existingBook => {
            const existingId = existingBook.id || existingBook.asin || existingBook.isbn || existingBook.isbn_10 || `${existingBook.title}-${existingBook.author}`;
            return existingId === uniqueId;
          });
          
          if (!exists) {
            acc.push(book);
          } else {
            console.log('Duplicate book found:', uniqueId, book.title);
          }
          
          return acc;
        }, []);
        
        console.log('Original books count:', books.length);
        console.log('Unique books count:', uniqueBooks.length);
        console.log('Removed duplicates:', books.length - uniqueBooks.length);
        
        const total = result.total || uniqueBooks.length;
        
        setData({ 
          books: uniqueBooks, 
          total,
          matchType: uniqueBooks.length > 0 ? uniqueBooks[0].match_type || null : null
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [search_term, sort_by, sort_order, page, limit]);

  return { data, isLoading, error };
}; 