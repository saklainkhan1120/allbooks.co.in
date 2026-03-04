import { Suspense } from 'react';
import { User, Filter } from 'lucide-react';
import { BookGrid } from '@/components/BookGrid';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientPagination } from '@/components/ClientPagination';
import { getBooksWithFilters } from '@/lib/data';

const BOOKS_PAGE_SIZE = 30; // Global page size

interface AuthorPageProps {
  authorSlug: string;
  searchParams: { 
    page?: string; 
    genre_filter?: string; 
    language_filter?: string; 
    min_price?: string; 
    max_price?: string; 
    sort_by?: string; 
    sort_order?: string 
  };
}

const AuthorContent = async ({ authorSlug, searchParams }: AuthorPageProps) => {
  const currentPage = parseInt(searchParams.page || '1');
  const genreFilter = searchParams.genre_filter || '';
  const languageFilter = searchParams.language_filter || '';
  const minPrice = searchParams.min_price ? parseInt(searchParams.min_price) : undefined;
  const maxPrice = searchParams.max_price ? parseInt(searchParams.max_price) : undefined;
  const sortBy = (searchParams.sort_by as 'created_at' | 'publication_date' | 'title' | 'best_seller_rank') || 'created_at';
  const sortOrder = (searchParams.sort_order as 'asc' | 'desc') || 'desc';

  // Fetch books with filters server-side
  const filterParams = {
    author_filter: authorSlug,
    genre_filter: genreFilter || undefined,
    language_filter: languageFilter || undefined,
    min_price: minPrice,
    max_price: maxPrice,
    sort_by: sortBy,
    sort_order: sortOrder,
    page: currentPage,
    limit: BOOKS_PAGE_SIZE
  };

  const result = await getBooksWithFilters(filterParams);
  const books = result.books;
  const total = result.total;
  const totalPages = Math.ceil(total / BOOKS_PAGE_SIZE);

  return (
    <div className="bg-background">
      <section className="py-8 px-4 text-center bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-gray-900">Books by {authorSlug}</h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">Browse all books by {authorSlug}.</p>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Filters Section */}
          <div className="mb-6">
            <form method="get" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    name="genre_filter"
                    placeholder="Genre..."
                    defaultValue={genreFilter}
                  />
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    name="language_filter"
                    placeholder="Language..."
                    defaultValue={languageFilter}
                  />
                </div>
                <div>
                  <Label htmlFor="minPrice">Min Price (₹)</Label>
                  <Input
                    id="minPrice"
                    name="min_price"
                    type="number"
                    placeholder="0"
                    defaultValue={minPrice || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">Max Price (₹)</Label>
                  <Input
                    id="maxPrice"
                    name="max_price"
                    type="number"
                    placeholder="100"
                    defaultValue={maxPrice || ''}
                  />
                </div>
              </div>
              
              <div className="flex gap-4 items-center">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select name="sort_by" defaultValue={sortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at">Recently Added</SelectItem>
                    <SelectItem value="publication_date">Publication Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="best_seller_rank">Bestseller Rank</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select name="sort_order" defaultValue={sortOrder}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button type="submit" variant="outline">
                  Apply Filters
                </Button>
              </div>
            </form>
          </div>
        </div>

        <BookGrid books={books} loading={false} />

        {totalPages > 1 && (
          <div className="mt-8">
            <ClientPagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl={`/author/${encodeURIComponent(authorSlug)}`}
            />
          </div>
        )}

        {books.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              No books found by {authorSlug}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const AuthorPage = ({ authorSlug, searchParams }: AuthorPageProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthorContent authorSlug={authorSlug} searchParams={searchParams} />
    </Suspense>
  );
}; 