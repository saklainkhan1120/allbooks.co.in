import { db } from './database';
import { Book } from '@/types/book';
import { unstable_cache } from 'next/cache';

// Helper function to convert BigInt and Decimal values
function convertBigIntAndDecimal(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (typeof obj === 'object') {
    // Handle Decimal objects (Prisma Decimal type)
    if (obj.constructor.name === 'Decimal' || (obj.s !== undefined && obj.e !== undefined && obj.d !== undefined)) {
      return Number(obj);
    }
    
    // Handle Date objects
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(convertBigIntAndDecimal);
    }
    
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntAndDecimal(value);
    }
    return converted;
  }
  
  return obj;
}

export const BOOKS_PAGE_SIZE = 30; // Global page size for all pages

interface DailyDeal {
  id: string;
  asin: string;
  position: number;
  is_top_six: boolean;
  is_fixed_position: boolean;
  created_at?: string;
  discount_percentage?: number;
  original_price?: number;
  deal_price?: number;
}

interface BookData {
  asin: string;
  title: string;
  author: string;
  cover_image_url: string;
  main_genre: string;
  inr_price: number;
  usd_price: number;
  selling_price_inr: number;
}

export interface DailyDealBook extends Book {
  position: number;
  is_top_six: boolean;
  is_fixed_position: boolean;
  discount_percentage?: number;
  original_price?: number;
  deal_price?: number;
}

// RPC-based getBestsellers for better performance with server-side caching
export const getBestsellers = async (page = 1, limit = BOOKS_PAGE_SIZE) => {
  return unstable_cache(
    async () => {
      try {
        const { data, error, count } = await db.bestsellers.getAll(page, limit);

        if (error) {
          console.error('Error fetching bestsellers:', error);
          return { books: [], total: 0 };
        }

        // Transform data to match expected format and convert Decimal values
        const books = data?.map((item: any) => {
          // Convert Decimal values to numbers for proper serialization
          return convertBigIntAndDecimal(item);
        }) || [];

        return { books, total: count || 0 };
      } catch (err) {
        console.error('Error in getBestsellers:', err);
        return { books: [], total: 0 };
      }
    },
    [`bestsellers-${page}-${limit}`],
    {
      revalidate: 3600, // 1 hour – high traffic, reduce DB load
      tags: ['bestsellers']
    }
  )();
};

// getNewReleases with server-side caching
export const getNewReleases = async (page = 1, limit = BOOKS_PAGE_SIZE) => {
  return unstable_cache(
    async () => {
      try {
        const { data, error, count } = await db.books.getNewReleases(page, limit);

        if (error) {
          console.error('Error fetching new releases:', error);
          return { books: [], total: 0 };
        }

        // Convert Decimal values to numbers for proper serialization
        const books = data?.map((item: any) => convertBigIntAndDecimal(item)) || [];

        return { books, total: count || 0 };
      } catch (err) {
        console.error('Error in getNewReleases:', err);
        return { books: [], total: 0 };
      }
    },
    [`new-releases-${page}-${limit}`],
    {
      revalidate: 1800, // Revalidate every 30 minutes (more frequent for new releases)
      tags: ['new-releases']
    }
  )();
};

// getJustListed with server-side caching
export const getJustListed = async (page = 1, limit = BOOKS_PAGE_SIZE) => {
  return unstable_cache(
    async () => {
      try {
        const { data, error, count } = await db.books.getJustListed(page, limit);

        if (error) {
          console.error('Error fetching just listed books:', error);
          return { books: [], total: 0 };
        }

        // Convert Decimal values to numbers for proper serialization
        const books = data?.map((item: any) => convertBigIntAndDecimal(item)) || [];

        return { books, total: count || 0 };
      } catch (err) {
        console.error('Error in getJustListed:', err);
        return { books: [], total: 0 };
      }
    },
    [`just-listed-${page}-${limit}`],
    {
      revalidate: 1800, // Revalidate every 30 minutes
      tags: ['just-listed']
    }
  )();
};

// getDailyDeals - Fixed to match React app approach with server-side caching
export const getDailyDeals = async (page = 1, limit = BOOKS_PAGE_SIZE) => {
  return unstable_cache(
    async () => {
      try {
        // Get actual deals from daily_deals table (matching React app approach)
        const { data: deals, error } = await db.deals.getAll();

        if (error) {
          console.error('Error fetching daily deals:', error);
          return { books: [], total: 0 };
        }

        if (!deals || deals.length === 0) {
          return { books: [], total: 0 };
        }

        // Combine deals with book data (DB layer returns flat book_title, book_author, etc.)
        const dealsWithBooks = deals.map((deal: any) => {
          const dealData = {
            id: deal.id,
            asin: deal.asin,
            position: Number(deal.position),
            is_top_six: Boolean(deal.is_top_six),
            is_fixed_position: Boolean(deal.is_fixed_position),
            created_at: deal.created_at,
            title: deal.book_title || '',
            author: deal.book_author || '',
            cover_image_url: deal.book_cover_image_url || '',
            main_genre: '',
            inr_price: deal.book_inr_price ?? 0,
            usd_price: 0,
            selling_price_inr: deal.book_inr_price ?? 0,
            discount_percentage: deal.discount_percentage,
            original_price: deal.original_price,
            deal_price: deal.deal_price,
          };
          return convertBigIntAndDecimal(dealData);
        });

        // Apply pagination
        const offset = (page - 1) * limit;
        const paginatedDeals = dealsWithBooks.slice(offset, offset + limit);

        return { books: paginatedDeals, total: dealsWithBooks.length };
      } catch (err) {
        console.error('Error in getDailyDeals:', err);
        return { books: [], total: 0 };
      }
    },
    [`daily-deals-${page}-${limit}`],
    {
      revalidate: 1800, // Revalidate every 30 minutes
      tags: ['daily-deals']
    }
  )();
};

// getGenres with server-side caching
export const getGenres = async () => {
  return unstable_cache(
    async () => {
      try {
        const { data, error } = await db.categories.getGenreCounts();

        if (error) {
          console.error('Error fetching genres:', error);
          return [];
        }

        // DB returns { genre, count }; UI expects { category, count }
        const convertedData = (data || []).map((item: any) => ({
          category: item.genre ?? item.category ?? 'Uncategorized',
          count: Number(item.count ?? 0),
        }));
        return convertBigIntAndDecimal(convertedData);
      } catch (err) {
        console.error('Error in getGenres:', err);
        return [];
      }
    },
    ['genres'],
    {
      revalidate: 3600, // 1 hour – categories change rarely, reduce DB load
      tags: ['genres']
    }
  )();
};

// getAuthors with server-side caching
export const getAuthors = async () => {
  return unstable_cache(
    async () => {
      try {
        const { data, error } = await db.categories.getAuthorCounts();

        if (error) {
          console.error('Error fetching authors:', error);
          return [];
        }

        // Transform to match expected format: { author, count } (DB returns { author, count })
        const authors = data?.map((item: any) => ({
          author: item.author ?? item.author_name,
          count: item.count ?? item.book_count
        })) || [];

        // Convert BigInt and Decimal values for client components
        const convertedAuthors = convertBigIntAndDecimal(authors);

        return convertedAuthors;
      } catch (err) {
        console.error('Error in getAuthors:', err);
        return [];
      }
    },
    ['authors'],
    {
      revalidate: 3600, // Revalidate every hour
      tags: ['authors']
    }
  )();
};

// getPublishers with server-side caching
export const getPublishers = async (page = 1, limit = 30, searchTerm = '') => {
  return unstable_cache(
    async () => {
      try {
        const { data, error } = await db.categories.getPublisherCounts();

        if (error) {
          console.error('Error fetching publishers:', error);
          return { publishers: [], total: 0 };
        }

        // DB returns { publisher, count }; support legacy shape for compatibility
        let publishers = (data || []).map((item: any) => ({
          publisher: item.publisher ?? item.publisher_name,
          count: item.count ?? item.book_count
        }));

        // Apply search filter if provided
        if (searchTerm.trim()) {
          publishers = publishers.filter(publisher =>
            publisher.publisher.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Apply pagination
        const total = publishers.length;
        const offset = (page - 1) * limit;
        const paginatedPublishers = publishers.slice(offset, offset + limit);

        // Convert BigInt and Decimal values for client components
        const convertedPublishers = convertBigIntAndDecimal(paginatedPublishers);
        const convertedTotal = convertBigIntAndDecimal(total);

        return { publishers: convertedPublishers, total: convertedTotal };
      } catch (err) {
        console.error('Error in getPublishers:', err);
        return { publishers: [], total: 0 };
      }
    },
    [`publishers-${page}-${limit}-${searchTerm}`],
    {
      revalidate: 3600, // Revalidate every hour
      tags: ['publishers']
    }
  )();
};

// getDailyDealsPage - Get all deals for the deals page
export const getDailyDealsPage = async () => {
  return unstable_cache(
    async () => {
      try {
        const { data: deals, error } = await db.deals.getAll();

        if (error) {
          console.error('Error fetching daily deals page:', error);
          return [];
        }

        // DB returns flat book_title, book_author, etc.
        const dealsWithBooks = deals?.map((deal: any) => ({
          id: deal.id,
          asin: deal.asin,
          position: Number(deal.position),
          is_top_six: Boolean(deal.is_top_six),
          is_fixed_position: Boolean(deal.is_fixed_position),
          created_at: deal.created_at,
          title: deal.book_title || '',
          author: deal.book_author || '',
          cover_image_url: deal.book_cover_image_url || '',
          main_genre: '',
          inr_price: deal.book_inr_price ?? 0,
          usd_price: 0,
          selling_price_inr: deal.book_inr_price ?? 0,
          discount_percentage: deal.discount_percentage,
          original_price: deal.original_price,
          deal_price: deal.deal_price,
        })) || [];

        return dealsWithBooks;
      } catch (err) {
        console.error('Error in getDailyDealsPage:', err);
        return [];
      }
    },
    ['daily-deals-page'],
    {
      revalidate: 1800, // Revalidate every 30 minutes
      tags: ['daily-deals-page']
    }
  )();
};

// SCALABLE SOLUTION: Hybrid approach - server-side direct calls, client-side API calls
export const getBooksWithFilters = async (
  filters: {
    genre_filter?: string;
    author_filter?: string;
    publisher_filter?: string;
    subject_filter?: string;
    tag_filter?: string;
    language_filter?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: 'title' | 'publication_date' | 'best_seller_rank' | 'created_at';
    sort_order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  },
  page = 1,
  limit = BOOKS_PAGE_SIZE
) => {
  // Check if we're in a server context where direct database calls are possible
  if (typeof window === 'undefined') {
    // Server-side: use direct database calls
    const { 
      genre_filter, 
      author_filter, 
      publisher_filter, 
      subject_filter, 
      tag_filter, 
      language_filter, 
      min_price, 
      max_price, 
      sort_by = 'created_at', 
      sort_order = 'desc', 
      page: filterPage = 1, 
      limit: filterLimit = BOOKS_PAGE_SIZE 
    } = filters;
    
    const offset = (filterPage - 1) * filterLimit;
    
    try {
      const { data, error } = await db.books.filter({
        genre_filter: genre_filter || null,
        author_filter: author_filter || null,
        language_filter: language_filter || null,
        min_price: min_price || null,
        max_price: max_price || null,
        sort_by: sort_by,
        sort_order: sort_order,
        page_limit: filterLimit,
        page_offset: offset,
        publisher_filter: publisher_filter || null,
        subject_filter: subject_filter || null,
        tag_filter: tag_filter || null,
      });

      if (error) {
        console.error('Error fetching filtered books:', error);
        return { books: [], total: 0 };
      }
      
      let books: Book[] = [];
      if (Array.isArray(data)) {
        // Convert BigInt and Decimal values for client components
        books = data.map(convertBigIntAndDecimal) as Book[];
      }
      
      const total = books.length > 0 && (books[0] as any).total_count ? Number((books[0] as any).total_count) : books.length;
      
      return { 
        books: books, 
        total 
      };
    } catch (err) {
      console.error('Error in getBooksWithFilters:', err);
      return { books: [], total: 0 };
    }
  } else {
    // Client-side: use API route
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.genre_filter) params.append('genre_filter', filters.genre_filter);
      if (filters.author_filter) params.append('author_filter', filters.author_filter);
      if (filters.publisher_filter) params.append('publisher_filter', filters.publisher_filter);
      if (filters.subject_filter) params.append('subject_filter', filters.subject_filter);
      if (filters.tag_filter) params.append('tag_filter', filters.tag_filter);
      if (filters.language_filter) params.append('language_filter', filters.language_filter);
      if (filters.min_price) params.append('min_price', filters.min_price.toString());
      if (filters.max_price) params.append('max_price', filters.max_price.toString());
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.sort_order) params.append('sort_order', filters.sort_order);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      // Call the API route
      const response = await fetch(`/api/books/filter?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('API Error:', data.error);
        return { books: [], total: 0 };
      }

      return { books: data.books || [], total: data.total || 0 };
    } catch (err) {
      console.error('Error in getBooksWithFilters (client):', err);
      return { books: [], total: 0 };
    }
  }
};

// getBooks - Get all books with pagination
export const getBooks = async (page = 1, limit = BOOKS_PAGE_SIZE) => {
  return unstable_cache(
    async () => {
      try {
        const offset = (page - 1) * limit;
        
        const { data, error } = await db.books.getAll();

        if (error) {
          console.error('Error fetching books:', error);
          return { books: [], total: 0 };
        }

        // Apply pagination manually
        const books = data?.slice(offset, offset + limit) || [];
        const total = data?.length || 0;

        return { books, total };
      } catch (err) {
        console.error('Error in getBooks:', err);
        return { books: [], total: 0 };
      }
    },
    [`books-${page}-${limit}`],
    {
      revalidate: 3600, // Revalidate every hour
      tags: ['books']
    }
  )();
};

// searchBooks - Search books by query
export const searchBooks = async (query: string, page = 1, limit = BOOKS_PAGE_SIZE) => {
  return unstable_cache(
    async () => {
      try {
        const offset = (page - 1) * limit;
        
        const { data, error, count } = await db.books.search(query, page, limit);

        if (error) {
          console.error('Error searching books:', error);
          return { books: [], total: 0 };
        }

        return { books: data || [], total: count || 0 };
      } catch (err) {
        console.error('Error in searchBooks:', err);
        return { books: [], total: 0 };
      }
    },
    [`search-books-${query}-${page}-${limit}`],
    {
      revalidate: 1800, // Revalidate every 30 minutes
      tags: ['search-books']
    }
  )();
};

// getBook - Get a single book by identifier (ASIN, ISBN, or ID)
export const getBook = async (identifier: string) => {
  return unstable_cache(
    async () => {
      try {
        // Try to get by identifier (ASIN, ISBN, or ID)
        const { data: book, error } = await db.books.getByIdentifier(identifier);
        
        if (!error && book) {
          // Convert BigInt and Decimal values for client components
          return convertBigIntAndDecimal(book);
        }

        // If not found, return null
        return null;
      } catch (err) {
        console.error('Error in getBook:', err);
        return null;
      }
    },
    [`book-${identifier}`],
    {
      revalidate: 3600, // Revalidate every hour
      tags: ['book']
    }
  )();
};

// getDailyDealsForBook - Get deals for a specific book
export const getDailyDealsForBook = async (bookASIN: string) => {
  return unstable_cache(
    async () => {
      try {
        const { data: deals, error } = await db.deals.getForBook(bookASIN);

        if (error) {
          console.error('Error fetching deals for book:', error);
          return [];
        }

        // DB returns flat book_title, book_author, etc.
        const dealsWithBooks = deals?.map((deal: any) => {
          const convertedDeal = {
            id: deal.id,
            asin: deal.asin,
            position: Number(deal.position),
            is_top_six: Boolean(deal.is_top_six),
            is_fixed_position: Boolean(deal.is_fixed_position),
            created_at: deal.created_at,
            title: deal.book_title || '',
            author: deal.book_author || '',
            cover_image_url: deal.book_cover_image_url || '',
            main_genre: '',
            inr_price: deal.book_inr_price ?? 0,
            usd_price: 0,
            selling_price_inr: deal.book_inr_price ?? 0,
            discount_percentage: deal.discount_percentage,
            original_price: deal.original_price,
            deal_price: deal.deal_price,
          };
          return convertBigIntAndDecimal(convertedDeal);
        }) || [];

        return dealsWithBooks;
      } catch (err) {
        console.error('Error in getDailyDealsForBook:', err);
        return [];
      }
    },
    [`deals-for-book-${bookASIN}`],
    {
      revalidate: 1800, // Revalidate every 30 minutes
      tags: ['deals-for-book']
    }
  )();
};

// getSimilarBooks - Get similar books
export const getSimilarBooks = async (currentBookId?: string, currentTitle?: string, currentAuthor?: string, currentGenre?: string) => {
  return unstable_cache(
    async () => {
      try {
        const { data, error } = await db.books.getSimilar(currentBookId, currentTitle, currentAuthor, currentGenre);

        if (error) {
          console.error('Error fetching similar books:', error);
          return [];
        }

        // Convert BigInt and Decimal values for client components
        const convertedData = convertBigIntAndDecimal(data || []);
        return convertedData;
      } catch (err) {
        console.error('Error in getSimilarBooks:', err);
        return [];
      }
    },
    [`similar-books-${currentBookId}-${currentTitle}-${currentAuthor}-${currentGenre}`],
    {
      revalidate: 3600, // Revalidate every hour
      tags: ['similar-books']
    }
  )();
};

// getBestsellerManagementData - Get data for bestseller management
export const getBestsellerManagementData = async () => {
  return unstable_cache(
    async () => {
      try {
        const { data, error, count } = await db.bestsellers.getAll(100, 0); // Get more for management

        if (error) {
          console.error('Error fetching bestseller management data:', error);
          return { bestsellers: [], total: 0 };
        }

        // Transform data to match expected format
        const bestsellers = data?.map((item: any) => {
          // If it's a bestseller with book relation, extract the book data
          if (item.book) {
            return {
              ...item.book,
              bestseller_id: item.id,
              added_date: item.added_date
            };
          }
          // Otherwise return the item as is
          return item;
        }) || [];

        return { bestsellers, total: count || 0 };
      } catch (err) {
        console.error('Error in getBestsellerManagementData:', err);
        return { bestsellers: [], total: 0 };
      }
    },
    ['bestseller-management-data'],
    {
      revalidate: 1800, // Revalidate every 30 minutes
      tags: ['bestseller-management']
    }
  )();
};

// addBestsellerByASIN - Add a book to bestsellers
export const addBestsellerByASIN = async (asin: string) => {
  try {
    const { data, error } = await db.bestsellers.addByASIN(asin);

          if (error) {
        console.error('Error adding bestseller:', error);
        return { success: false, error: (error as any).message || 'Failed to add bestseller' };
      }

    return { success: true, data };
  } catch (err) {
    console.error('Error in addBestsellerByASIN:', err);
    return { success: false, error: 'Failed to add bestseller' };
  }
};

// removeBestsellerByASIN - Remove a book from bestsellers
export const removeBestsellerByASIN = async (asin: string) => {
  try {
    const { data, error } = await db.bestsellers.removeByASIN(asin);

          if (error) {
        console.error('Error removing bestseller:', error);
        return { success: false, error: (error as any).message || 'Failed to remove bestseller' };
      }

    return { success: true, data };
  } catch (err) {
    console.error('Error in removeBestsellerByASIN:', err);
    return { success: false, error: 'Failed to remove bestseller' };
  }
};

// bulkAddBestsellers - Add multiple books to bestsellers
export const bulkAddBestsellers = async (asins: string[]) => {
  try {
    const results = await Promise.all(
      asins.map(asin => db.bestsellers.addByASIN(asin))
    );

    const successful = results.filter(result => !result.error);
    const failed = results.filter(result => result.error);

    return {
      success: true,
      added: successful.length,
      failed: failed.length,
      errors: failed.map(result => result.error)
    };
  } catch (err) {
    console.error('Error in bulkAddBestsellers:', err);
    return { success: false, error: 'Failed to bulk add bestsellers' };
  }
}; 