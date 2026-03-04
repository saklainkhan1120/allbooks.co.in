import { Suspense } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { BookCard } from "@/components/BookCard";
import { ClientPagination } from "@/components/ClientPagination";
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getGenres, getBooksWithFilters } from "@/lib/data";

// Enable ISR for categories page
export const revalidate = 1800; // Revalidate every 30 minutes

interface GenreData {
  genre: string;
  count: number;
}

interface BooksResponse {
  books: any[];
  total: number;
}

interface CategoriesPageProps {
  searchParams: { page?: string; category?: string; search?: string };
}

const CategoriesContent = async ({ searchParams }: CategoriesPageProps) => {
  const currentPage = parseInt(searchParams.page || '1');
  const selectedCategory = searchParams.category || null;
  const categorySearchTerm = searchParams.search || "";
  const pageLimit = 20;
  
  // Fetch genres data server-side
  const genresData = await getGenres();
  
  // Filter categories based on search term
  const filteredCategories = genresData?.filter((item: { category: string; count: number }) =>
    item.category?.toLowerCase().includes(categorySearchTerm.toLowerCase())
  ) || [];
  
  // Fetch books with genre or subject category filter if selected
  const books = selectedCategory ? await getBooksWithFilters({
    genre_filter: selectedCategory,
    subject_filter: selectedCategory,
    page: currentPage,
    limit: pageLimit,
  }) : await getBooksWithFilters({
    page: currentPage,
    limit: pageLimit,
  });

  const totalPages = books ? Math.ceil((books.total || 0) / pageLimit) : 0;

  return (
    <div className="bg-white overflow-hidden">
      <section className="py-8 px-4 text-center bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto">
          <div className="mb-4">
            <Breadcrumbs 
              items={[
                { label: 'Home', path: '/' },
                { label: 'Categories', isCurrent: true }
              ]}
            />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2 text-gray-900">Categories</h1>
          <p className="text-lg text-gray-600 mb-4">Explore our carefully curated collection of books across all categories. From compelling fiction to insightful non-fiction, find your perfect match.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Browse by Category */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:sticky lg:top-8 lg:max-h-[calc(100vh-2rem)] lg:flex lg:flex-col lg:min-h-0">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-[#007399]" />
                <h2 className="text-xl font-semibold text-gray-900">Browse by Category</h2>
              </div>
              
              {/* Search Bar */}
              <div className="sticky top-0 z-10 bg-white pb-2">
                <form method="get" className="flex gap-2">
                  <input
                    type="text"
                    name="search"
                    placeholder="Search categories..."
                    defaultValue={categorySearchTerm}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#007399] focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#007399] text-white rounded-md text-sm hover:bg-[#005a7a] transition-colors"
                  >
                    Search
                  </button>
                </form>
              </div>
              
              {/* All Categories Button */}
              <Link
                href="/categories"
                className={`w-full mb-4 px-4 py-3 rounded-lg font-medium transition-colors text-center block ${
                  selectedCategory === null
                    ? 'bg-[#007399] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </Link>
              
              {/* Category List */}
              <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
                {filteredCategories.map((item: { category: string; count: number }) => (
                  <Link
                    key={item.category}
                    href={`/categories?category=${encodeURIComponent(item.category || '')}`}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center block ${
                      selectedCategory === item.category
                        ? 'bg-[#007399] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate">{item.category}</span>
                    <span className={`text-xs ${selectedCategory === item.category ? 'text-white' : 'text-gray-500'}`}>
                      ({item.count})
                    </span>
                  </Link>
                ))}
              </div>
              
              {filteredCategories.length === 0 && categorySearchTerm && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No categories found matching &quot;{categorySearchTerm}&quot;</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area - All Books */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-[#007399]" />
                <h2 className="text-xl font-semibold text-gray-900">All Books</h2>
              </div>
              
              <p className="text-gray-600 mb-2">Your complete digital library.</p>
              
              {books && (
                <p className="text-lg font-semibold text-gray-900 mb-6">
                  Found <span className="font-bold">{books.total || 0}</span> books
                </p>
              )}

              {books && books.books && books.books.length > 0 ? (
                <>
                  {/* Books Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                    {books.books.map((book: any) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <ClientPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      baseUrl={selectedCategory ? `/categories?category=${encodeURIComponent(selectedCategory)}` : "/categories"}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No books found for the selected category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategoriesPage = ({ searchParams }: CategoriesPageProps) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoriesContent searchParams={searchParams} />
    </Suspense>
  );
}; 