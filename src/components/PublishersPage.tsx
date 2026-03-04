'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { ClientPagination } from '@/components/ClientPagination';

interface PublisherData {
  publisher: string | null;
  count: number;
}

interface PublishersPageProps {
  publishersData: {
    publishers: PublisherData[];
    total: number;
  };
  currentPage: number;
  searchTerm: string;
}

export const PublishersPage = ({ publishersData, currentPage, searchTerm }: PublishersPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  const PUBLISHERS_PER_PAGE = 30;
  
  // Filter out null publishers
  const validPublishers = publishersData.publishers.filter(p => p.publisher !== null);
  const totalPublishers = publishersData.total;
  const totalPages = Math.ceil(totalPublishers / PUBLISHERS_PER_PAGE);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearchTerm.trim()) {
      params.set('search', localSearchTerm.trim());
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to first page when searching
    router.push(`/publishers?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(e as any);
    }
  };



  return (
    <div className="bg-background min-h-screen">
      <section className="py-8 px-4 text-center bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto">
          <div className="mb-4">
            <Breadcrumbs 
              items={[
                { label: 'Home', path: '/' },
                { label: 'Publishers', isCurrent: true }
              ]}
            />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-5xl font-bold mb-2 text-gray-900">Publishers</h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">Browse books by publisher</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search publishers... (Press Enter to search)"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </form>
        </div>

        {/* Publishers Grid */}
        {validPublishers.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {validPublishers.map((publisher: PublisherData) => (
                <Link
                  key={publisher.publisher}
                  href={`/publisher/${encodeURIComponent(publisher.publisher || '')}`}
                  className="group block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-primary transition-all duration-200"
                >
                  <div className="flex items-center justify-center h-16 mb-3">
                    <Building2 className="h-8 w-8 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-center text-sm leading-tight group-hover:text-primary transition-colors">
                    {publisher.publisher}
                  </h3>
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {publisher.count} {publisher.count === 1 ? 'book' : 'books'}
                  </p>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <ClientPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl={`/publishers${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-500">
              {searchTerm ? 'No publishers found matching your search.' : 'No publishers found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 