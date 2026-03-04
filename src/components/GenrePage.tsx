import { Suspense } from 'react';
import { BookOpen, Filter } from 'lucide-react';
import { BookGrid } from '@/components/BookGrid';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientPagination } from '@/components/ClientPagination';
import { getBooksWithFilters } from '@/lib/data';

const BOOKS_PAGE_SIZE = 30; // Global page size

interface GenrePageProps {
  genreSlug: string;
  searchParams: { page?: string; author_filter?: string; language_filter?: string; min_price?: string; max_price?: string; sort_by?: string; sort_order?: string };
}

export const GenrePage = async ({ genreSlug, searchParams }: GenrePageProps) => {
  const currentPage = parseInt(searchParams.page || '1');
  const page_offset = (currentPage - 1) * BOOKS_PAGE_SIZE;
  const page_limit = BOOKS_PAGE_SIZE;

  // Fetch books with filters
  const filterParams = {
    genre_filter: genreSlug,
    author_filter: searchParams.author_filter || undefined,
    language_filter: searchParams.language_filter || undefined,
    min_price: searchParams.min_price ? Number(searchParams.min_price) : undefined,
    max_price: searchParams.max_price ? Number(searchParams.max_price) : undefined,
    sort_by: (searchParams.sort_by as 'created_at' | 'publication_date' | 'title' | 'best_seller_rank') || 'created_at',
    sort_order: (searchParams.sort_order as 'asc' | 'desc') || 'desc',
    page: currentPage,
    limit: BOOKS_PAGE_SIZE
  };

  const result = await getBooksWithFilters(filterParams);
  const { books, total } = result;
  const totalPages = Math.ceil(total / BOOKS_PAGE_SIZE);

  return (
    <div className="bg-background">
      <section className="py-8 px-4 text-center bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-gray-900">{genreSlug} Books</h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">Browse all {genreSlug} books in our collection.</p>
        </div>
      </section>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="mb-6">
            <form method="get" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    name="author_filter"
                    placeholder="Author..."
                    defaultValue={searchParams.author_filter || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    name="language_filter"
                    placeholder="Language..."
                    defaultValue={searchParams.language_filter || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="minPrice">Min Price (₹)</Label>
                  <Input
                    id="minPrice"
                    name="min_price"
                    type="number"
                    placeholder="0"
                    defaultValue={searchParams.min_price || ''}
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">Max Price (₹)</Label>
                  <Input
                    id="maxPrice"
                    name="max_price"
                    type="number"
                    placeholder="100"
                    defaultValue={searchParams.max_price || ''}
                  />
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select name="sort_by" defaultValue={searchParams.sort_by || 'created_at'}>
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
                
                <Select name="sort_order" defaultValue={searchParams.sort_order || 'desc'}>
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
              baseUrl={`/genre/${encodeURIComponent(genreSlug)}`}
            />
          </div>
        )}

        {books.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              No books found in {genreSlug} category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 