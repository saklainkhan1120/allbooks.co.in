'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";

interface ClientPaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

export const ClientPagination = ({
  currentPage,
  totalPages,
  baseUrl,
}: ClientPaginationProps) => {
  const router = useRouter();
  
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const createPageUrl = (page: number) => {
    // Parse the base URL to extract path and existing query parameters
    const urlParts = baseUrl.split('?');
    const path = urlParts[0];
    const existingParams = urlParts[1] || '';
    
    // Parse existing parameters
    const params = new URLSearchParams(existingParams);
    
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    
    const queryString = params.toString();
    return `${path}${queryString ? '?' + queryString : ''}`;
  };

  const handlePageChange = (page: number) => {
    const url = createPageUrl(page);
    router.push(url);
  };

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          {currentPage > 1 ? (
            <PaginationPrevious 
              className="cursor-pointer" 
              onClick={() => handlePageChange(currentPage - 1)}
            />
          ) : (
            <PaginationPrevious className="pointer-events-none opacity-50" />
          )}
        </PaginationItem>

        {visiblePages.map((page, index) => (
          <PaginationItem key={index}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={currentPage === page}
                className="cursor-pointer"
                onClick={() => handlePageChange(page as number)}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          {currentPage < totalPages ? (
            <PaginationNext 
              className="cursor-pointer" 
              onClick={() => handlePageChange(currentPage + 1)}
            />
          ) : (
            <PaginationNext className="pointer-events-none opacity-50" />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}; 