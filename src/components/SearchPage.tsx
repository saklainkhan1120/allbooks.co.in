'use client';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchBar } from "@/components/SearchBar";
import { BookGrid } from "@/components/BookGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PaginationComponent } from "@/components/PaginationComponent";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { useBookSearch } from "@/hooks/useBookSearch";

export const BOOKS_PAGE_SIZE = 30;

export const SearchPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchTerm = searchParams.get('q') || '';
  
  const [sortBy, setSortBy] = useState<'relevance' | 'created_at' | 'publication_date' | 'title' | 'best_seller_rank'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentSearchTerm, setCurrentSearchTerm] = useState(searchTerm);

  // Get page from URL params
  const urlPage = searchParams.get('page');
  const currentPage = urlPage ? parseInt(urlPage) : 1;

  // Reset page and search term when URL search term changes
  useEffect(() => {
    setCurrentSearchTerm(searchTerm);
  }, [searchTerm, currentPage]);

  const searchParams_obj = {
    search_term: searchTerm,
    sort_by: sortBy,
    sort_order: sortOrder,
    page: currentPage,
    limit: BOOKS_PAGE_SIZE
  };

  const { data: booksData, isLoading, error } = useBookSearch(searchParams_obj);
  
  const books = booksData?.books || [];
  const matchType = booksData?.matchType;

  const handleSearch = (newSearchTerm: string) => {
    // Clear the search term if it's empty
    if (!newSearchTerm.trim()) {
      router.push('/search');
      return;
    }
    
    // Update URL with new search term and reset page
    router.push(`/search?q=${encodeURIComponent(newSearchTerm.trim())}&page=1`);
  };

  const getMatchTypeMessage = (matchType: string | null) => {
    switch (matchType) {
      case 'exact_identifier':
        return "Found exact match for ASIN/ISBN";
      case 'full_text':
        return "Showing best matches";
      case 'keyword_extraction':
        return "Showing results based on keywords";
      case 'fuzzy':
        return "Showing similar results (did you mean something else?)";
      default:
        return null;
    }
  };

  const matchTypeMessage = getMatchTypeMessage(matchType || null);

  // Don't render search results if no search term
  if (!searchTerm.trim()) {
    return (
      <div className="bg-background">
        <section className="py-8 px-4 text-center bg-white border-b border-gray-200">
          <div className="container mx-auto">
            <div className="mb-4">
              <Breadcrumbs />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-gray-900 font-poppins">Search Books</h1>
            <p className="text-lg text-gray-600 mb-4 font-poppins">Find your next favorite book</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex gap-4 items-center mb-6">
              <div className="flex-1">
                <SearchBar 
                  onSearch={handleSearch}
                  placeholder="Search by title, author, ASIN, ISBN, or tag..."
                />
              </div>
            </div>
          </div>

          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-lg font-medium text-muted-foreground mb-2 font-poppins">Enter a search term</div>
            <p className="text-muted-foreground font-poppins">
              Type a book title, author name, or any keywords to find books.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <section className="py-8 px-4 text-center bg-white border-b border-gray-200">
        <div className="container mx-auto">
          <div className="mb-4">
            <Breadcrumbs />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-2 text-gray-900">Search Results</h2>
          <p className="text-lg text-gray-600 mb-4">Found results for &quot;{searchTerm}&quot;</p>
          {matchTypeMessage && (
            <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
              <Info className="h-4 w-4" />
              {matchTypeMessage}
            </div>
          )}
        </div>
      </section>

      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex gap-4 items-center mb-6">
              <div className="flex-1">
                <SearchBar 
                  onSearch={handleSearch}
                  placeholder="Search by title, author, ASIN, ISBN, or tag..."
                  initialValue={currentSearchTerm}
                />
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-sm text-gray-700 font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: 'relevance' | 'created_at' | 'publication_date' | 'title' | 'best_seller_rank') => setSortBy(value)}>
                <SelectTrigger className="w-48 bg-white border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Best Match</SelectItem>
                  <SelectItem value="created_at">Recently Added</SelectItem>
                  <SelectItem value="publication_date">Publication Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="best_seller_rank">Bestseller Rank</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="w-32 bg-white border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-lg font-medium text-red-600 mb-2 font-poppins">Search Error</div>
              <p className="text-red-500 font-poppins">{error.message}</p>
            </div>
          )}

          <BookGrid key={`${searchTerm}-${currentPage}`} books={books} loading={isLoading} />

          {books.length > 0 && booksData?.total && (
            <PaginationComponent
              currentPage={currentPage}
              totalPages={Math.ceil(booksData.total / BOOKS_PAGE_SIZE)}
              onPageChange={(newPage) => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('page', newPage.toString());
                router.push(`/search?${newSearchParams.toString()}`);
              }}
            />
          )}

          {books.length === 0 && !isLoading && searchTerm && !error && (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-lg font-medium text-muted-foreground mb-2 font-poppins">No books found</div>
              <p className="text-muted-foreground font-poppins">
                No books found matching &quot;{searchTerm}&quot;. Try different keywords or browse our categories.
              </p>
              <div className="mt-6">
                <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline font-poppins">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 