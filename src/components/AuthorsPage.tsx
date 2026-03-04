import { Suspense } from 'react';
import { BookOpen, User } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import { ClientPagination } from '@/components/ClientPagination';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import Link from 'next/link';

interface AuthorData {
  author: string;
  count: number;
}

interface BooksResponse {
  books: any[];
  total: number;
}

interface AuthorsPageProps {
  authorsData: AuthorData[];
  booksData: BooksResponse;
  currentPage: number;
  selectedAuthor: string | null;
}

const BOOKS_PAGE_SIZE = 20; // Page size for authors page

export const AuthorsPage = ({ 
  authorsData, 
  booksData, 
  currentPage, 
  selectedAuthor 
}: AuthorsPageProps) => {
  const totalPages = Math.ceil((booksData.total || 0) / BOOKS_PAGE_SIZE);
  
  // Calculate total books count for "All Authors"
  const totalBooksCount = authorsData.reduce((sum, author) => sum + (author.count || 0), 0);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Breadcrumbs 
          items={[
            { label: 'Home', path: '/' },
            { label: 'Authors', path: '/authors' }
          ]} 
        />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Authors List */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-[#007399]" />
                <h2 className="text-xl font-semibold text-gray-900">Authors</h2>
              </div>
              
              <p className="text-gray-600 mb-4">Browse books by author.</p>
              
              <div className="space-y-2 flex-1 min-h-0 overflow-y-auto max-h-96">
                {/* All Authors option */}
                <Link
                  href="/authors"
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center block ${
                    !selectedAuthor
                      ? 'bg-[#007399] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate">All Authors</span>
                  <span className={`text-xs ${!selectedAuthor ? 'text-white' : 'text-gray-500'}`}>
                    ({totalBooksCount})
                  </span>
                </Link>

                {/* Individual authors */}
                {authorsData && authorsData.length > 0 ? (
                  authorsData.map((item) => (
                    <Link
                      key={item.author}
                      href={`/authors?author=${encodeURIComponent(item.author)}`}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center block ${
                        selectedAuthor === item.author
                          ? 'bg-[#007399] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="truncate">{item.author}</span>
                      <span className={`text-xs ${selectedAuthor === item.author ? 'text-white' : 'text-gray-500'}`}>
                        ({item.count || 0})
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No authors found</p>
                  </div>
                )}
              </div>
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
              
              {selectedAuthor && (
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Books by: <span className="font-bold text-[#007399]">{selectedAuthor}</span>
                </p>
              )}
              
              <p className="text-lg font-semibold text-gray-900 mb-6">
                Found <span className="font-bold">{booksData.total || 0}</span> books
              </p>

              {booksData.books && booksData.books.length > 0 ? (
                <>
                  {/* Books Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
                    {booksData.books.map((book) => (
                      <BookCard key={book.id} book={book} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8">
                      <ClientPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl={`/authors${selectedAuthor ? `?author=${encodeURIComponent(selectedAuthor)}` : ''}`}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {selectedAuthor 
                      ? `No books found by "${selectedAuthor}".`
                      : "No books found for the selected author."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
