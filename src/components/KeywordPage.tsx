'use client';

import { useState, useEffect } from 'react';
import { BookGrid } from '@/components/BookGrid';
import { Button } from '@/components/ui/button';
import { searchBooks } from '@/lib/data';
import { Book } from '@/types/book';

const BOOKS_PAGE_SIZE = 30;

interface KeywordPageProps {
  keyword: Promise<{ keyword: string }>;
}

export const KeywordPage = ({ keyword }: KeywordPageProps) => {
  const [decodedKeyword, setDecodedKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Get keyword from params
  useEffect(() => {
    const getKeyword = async () => {
      const { keyword: keywordParam } = await keyword;
      setDecodedKeyword(decodeURIComponent(keywordParam));
    };
    getKeyword();
  }, [keyword]);

  // Fetch books with keyword search
  useEffect(() => {
    const fetchBooks = async () => {
      if (!decodedKeyword) return;
      
      setIsLoading(true);
      try {
        const result = await searchBooks(decodedKeyword, page, BOOKS_PAGE_SIZE);
        
        if (page === 1) {
          setBooks(result.books);
        } else {
          setBooks(prev => [...prev, ...result.books]);
        }
        
        setTotal(result.total);
        setHasMore(result.books.length === BOOKS_PAGE_SIZE);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [decodedKeyword, page]);

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          Books with keyword: &quot;{decodedKeyword}&quot;
        </h1>
        <p className="text-gray-600">
          Found {total} books containing &quot;{decodedKeyword}&quot;
        </p>
      </div>

      <BookGrid books={books} loading={isLoading} />

      {hasMore && !isLoading && (
        <div className="mt-8 text-center">
          <Button onClick={loadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}

      {books.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No books found containing &quot;{decodedKeyword}&quot;
          </p>
        </div>
      )}
    </div>
  );
}; 