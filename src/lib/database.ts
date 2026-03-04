import { prisma } from './prisma';
import * as bcrypt from 'bcryptjs';

// Show books with status null, empty, or 'active' (so migrated/legacy data appears on site)
const VISIBLE_BOOK_WHERE = { OR: [{ status: null }, { status: 'active' }, { status: '' }] };

// Database interface (MySQL-compatible; uses Prisma instead of PostgreSQL functions)
export const db = {
  // Books operations
  books: {
    getAll: async (page = 1, limit = 20) => {
      try {
        const offset = (page - 1) * limit;
        const data = await prisma.books.findMany({
          where: VISIBLE_BOOK_WHERE,
          orderBy: { created_at: 'desc' },
          skip: offset,
          take: limit,
        });
        
        const total = await prisma.books.count({
          where: VISIBLE_BOOK_WHERE
        });

        return { data, error: null, count: total };
      } catch (error) {
        return { data: null, error, count: 0 };
      }
    },

    getNewReleases: async (page = 1, limit = 20) => {
      try {
        const offset = (page - 1) * limit;
        // First try books with publication_date, then fallback to all books by created_at
        const withPubDate = await prisma.books.findMany({
          where: {
            AND: [
              VISIBLE_BOOK_WHERE,
              { publication_date: { not: null }, NOT: { publication_date: '' } }
            ]
          },
          orderBy: { publication_date: 'desc' },
          skip: offset,
          take: limit,
        });
        
        // If we have enough books with publication_date, use them
        if (withPubDate.length >= limit) {
          const total = await prisma.books.count({
            where: {
              AND: [
                VISIBLE_BOOK_WHERE,
                { publication_date: { not: null }, NOT: { publication_date: '' } }
              ]
            }
          });
          return { data: withPubDate, error: null, count: total };
        }
        
        // Otherwise, fallback to created_at order for all visible books
        const data = await prisma.books.findMany({
          where: VISIBLE_BOOK_WHERE,
          orderBy: { created_at: 'desc' },
          skip: offset,
          take: limit,
        });
        
        const total = await prisma.books.count({ where: VISIBLE_BOOK_WHERE });
        return { data, error: null, count: total };
      } catch (error) {
        console.error('Error in getNewReleases:', error);
        return { data: null, error, count: 0 };
      }
    },

    getJustListed: async (page = 1, limit = 20) => {
      try {
        const offset = (page - 1) * limit;
        const data = await prisma.books.findMany({
          where: VISIBLE_BOOK_WHERE,
          orderBy: { created_at: 'desc' },
          skip: offset,
          take: limit,
        });
        
        const total = await prisma.books.count({ where: VISIBLE_BOOK_WHERE });
        return { data, error: null, count: total };
      } catch (error) {
        console.error('Error in getJustListed:', error);
        return { data: null, error, count: 0 };
      }
    },

    getByIdentifier: async (identifier: string) => {
      try {
        const book = await prisma.books.findFirst({
          where: {
            AND: [
              {
                OR: [
                  { asin: identifier },
                  { isbn: identifier },
                  { isbn_10: identifier }
                ]
              },
              VISIBLE_BOOK_WHERE
            ]
          }
        });
        
        return { data: book, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Get book by ID
    getById: async (bookId: string) => {
      try {
        const data = await prisma.books.findUnique({
          where: { id: bookId }
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Get book by ASIN
    getByASIN: async (asin: string) => {
      try {
        const data = await prisma.books.findFirst({
          where: { asin }
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    search: async (query: string, page = 1, limit = 60, sortBy = 'relevance', sortOrder = 'desc') => {
      try {
        const offset = (page - 1) * limit;
        const q = (query || '').trim();
        const where = q
          ? {
              AND: [
                VISIBLE_BOOK_WHERE,
                {
                  OR: [
                    { title: { contains: q } },
                    { author: { contains: q } },
                    { asin: { contains: q } },
                    { isbn_10: { contains: q } },
                    { isbn: { contains: q } },
                  ],
                },
              ],
            }
          : VISIBLE_BOOK_WHERE;

        const [data, total] = await Promise.all([
          prisma.books.findMany({
            where,
            select: { id: true, title: true, author: true, asin: true, cover_image_url: true, inr_price: true },
            orderBy: sortBy === 'created_at' ? { created_at: sortOrder === 'asc' ? 'asc' : 'desc' } : { title: sortOrder === 'asc' ? 'asc' : 'desc' },
            take: limit,
            skip: offset,
          }),
          prisma.books.count({ where }),
        ]);

        const rows = data.map((b) => ({ ...b, total_count: total }));
        return { data: rows, error: null, count: total };
      } catch (error) {
        console.error('Search error:', error);
        return { data: null, error, count: 0 };
      }
    },

    // Simple search for admin panel (like backup app)
    searchSimple: async (query: string, page = 1, limit = 50) => {
      try {
        const offset = (page - 1) * limit;
        
        const data = await prisma.books.findMany({
          where: {
            AND: [
              {
                OR: [
                  { asin: { contains: query } },
                  { title: { contains: query } }
                ]
              },
              VISIBLE_BOOK_WHERE
            ]
          },
          take: limit,
          skip: offset,
          orderBy: { created_at: 'desc' }
        });

        // Filter out books with invalid ASINs (like backup app)
        const validResults = data.filter(book => {
          const isValid = book.asin && book.asin.length === 10 && /^[A-Z0-9]{10}$/.test(book.asin);
          return isValid;
        });

        return { data: validResults, error: null };
      } catch (error) {
        console.error('Simple search error:', error);
        return { data: null, error };
      }
    },

    filter: async (filters: any) => {
      try {
        const {
          genre_filter,
          author_filter,
          language_filter,
          min_price,
          max_price,
          sort_by = 'created_at',
          sort_order = 'desc',
          page_limit = 20,
          page_offset = 0,
          publisher_filter,
          subject_filter,
        } = filters;

        const and: any[] = [VISIBLE_BOOK_WHERE];
        if (genre_filter) and.push({ main_genre: { contains: genre_filter } });
        if (author_filter) and.push({ author: { contains: author_filter } });
        if (language_filter) and.push({ language: { contains: language_filter } });
        if (min_price != null) and.push({ inr_price: { gte: min_price } });
        if (max_price != null) and.push({ inr_price: { lte: max_price } });
        if (publisher_filter) and.push({ publisher: { contains: publisher_filter } });
        if (subject_filter) and.push({ subject_category_1: { contains: subject_filter } });

        const orderBy: any =
          sort_by === 'title' ? { title: sort_order } : sort_by === 'author' ? { author: sort_order } : sort_by === 'price' ? { inr_price: sort_order } : { created_at: sort_order };

        const [data, total] = await Promise.all([
          prisma.books.findMany({
            where: { AND: and },
            select: { id: true, title: true, author: true, asin: true, cover_image_url: true, inr_price: true },
            orderBy,
            take: page_limit,
            skip: page_offset,
          }),
          prisma.books.count({ where: { AND: and } }),
        ]);

        const rows = data.map((b) => ({ ...b, total_count: total }));
        return { data: rows, error: null, count: total };
      } catch (error) {
        return { data: null, error, count: 0 };
      }
    },

    getSimilar: async (currentBookId?: string, currentTitle?: string, currentAuthor?: string, currentGenre?: string, currentASIN?: string, maxResults = 6) => {
      try {
        const and: any[] = [VISIBLE_BOOK_WHERE];
        if (currentBookId) and.push({ id: { not: currentBookId } });

        const or: any[] = [];
        if (currentASIN) or.push({ asin: currentASIN });
        if (currentAuthor) or.push({ author: { equals: currentAuthor } });
        if (currentGenre) or.push({ main_genre: { equals: currentGenre } });
        if (currentTitle) or.push({ title: { contains: currentTitle } });
        if (or.length) and.push({ OR: or });

        const rows = await prisma.books.findMany({
          where: { AND: and },
          select: { id: true, title: true, author: true, asin: true, main_genre: true, cover_image_url: true, inr_price: true },
          orderBy: { created_at: 'desc' },
          take: maxResults,
        });

        const data = rows.map((b) => ({
          ...b,
          similarity_score: b.asin === currentASIN ? 1.0 : b.author === currentAuthor ? 0.8 : b.main_genre === currentGenre ? 0.6 : 0.4,
          match_type: b.asin === currentASIN ? 'exact_asin' : b.author === currentAuthor ? 'same_author' : b.main_genre === currentGenre ? 'same_genre' : 'title_match',
        }));
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Additional book functions for admin and bulk operations
    getByAuthor: async (author: string, limit = 20, offset = 0) => {
      try {
        const whereClause = {
          AND: [
            {
              OR: [
                { author: { equals: author } },
                { second_author_narrator: { equals: author } },
                { author_3: { equals: author } }
              ]
            },
            VISIBLE_BOOK_WHERE
          ]
        };

        const data = await prisma.books.findMany({
          where: whereClause,
          orderBy: { created_at: 'desc' },
          skip: offset,
          take: limit
        });

        const count = await prisma.books.count({ where: whereClause });

        return { data, error: null, count };
      } catch (error) {
        return { data: null, error, count: 0 };
      }
    },

    getByGenre: async (genre: string, limit = 20, offset = 0) => {
      try {
        const whereClause = {
          AND: [
            {
              OR: [
                { main_genre: { equals: genre } },
                { genre_2: { equals: genre } },
                { genre_3: { equals: genre } }
              ]
            },
            VISIBLE_BOOK_WHERE
          ]
        };

        const data = await prisma.books.findMany({
          where: whereClause,
          orderBy: { created_at: 'desc' },
          skip: offset,
          take: limit
        });

        const count = await prisma.books.count({ where: whereClause });

        return { data, error: null, count };
      } catch (error) {
        return { data: null, error, count: 0 };
      }
    },

    getByPublisher: async (publisher: string, limit = 20, offset = 0) => {
      try {
        const whereClause = {
          AND: [
            { publisher: { equals: publisher } },
            VISIBLE_BOOK_WHERE
          ]
        };

        const data = await prisma.books.findMany({
          where: whereClause,
          orderBy: { created_at: 'desc' },
          skip: offset,
          take: limit
        });

        const count = await prisma.books.count({ where: whereClause });

        return { data, error: null, count };
      } catch (error) {
        return { data: null, error, count: 0 };
      }
    },

    getCounts: async () => {
      try {
        const [total, active] = await Promise.all([
          prisma.books.count(),
          prisma.books.count({ where: VISIBLE_BOOK_WHERE })
        ]);
        return { data: { total, active }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    create: async (bookData: any) => {
      try {
        const result = await prisma.books.create({
          data: bookData
        });
        return { data: result, error: null };
      } catch (error) {
        console.error('Prisma create error:', error);
        return { data: null, error: error instanceof Error ? error.message : String(error) };
      }
    },

    update: async (id: string, bookData: any) => {
      try {
        const result = await prisma.books.update({
          where: { id },
          data: bookData
        });
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    delete: async (id: string) => {
      try {
        const result = await prisma.books.delete({
          where: { id }
        });
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    checkExisting: async (asin?: string, isbn?: string, isbn_10?: string) => {
      try {
        const whereClause: any = {};
        
        if (asin) whereClause.asin = asin;
        if (isbn) whereClause.isbn = isbn;
        if (isbn_10) whereClause.isbn_10 = isbn_10;

        if (Object.keys(whereClause).length === 0) {
          return { data: [], error: null };
        }

        const data = await prisma.books.findMany({
          where: {
            OR: Object.entries(whereClause).map(([key, value]) => ({ [key]: value }))
          }
        });

        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    checkMultipleExisting: async (asins?: string[], isbns?: string[], isbn10s?: string[]) => {
      try {
        const whereConditions: any[] = [];
        
        if (asins && asins.length > 0) {
          whereConditions.push({ asin: { in: asins } });
        }
        if (isbns && isbns.length > 0) {
          whereConditions.push({ isbn: { in: isbns } });
        }
        if (isbn10s && isbn10s.length > 0) {
          whereConditions.push({ isbn_10: { in: isbn10s } });
        }

        if (whereConditions.length === 0) {
          return { data: [], error: null };
        }

        const data = await prisma.books.findMany({
          where: {
            OR: whereConditions
          }
        });

        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  },

  // Categories operations
  categories: {
    getGenreCounts: async () => {
      try {
        const rows = await prisma.books.groupBy({
          by: ['main_genre'],
          where: VISIBLE_BOOK_WHERE,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        });
        const data = rows.map((r) => ({ genre: r.main_genre ?? 'Uncategorized', count: r._count.id }));
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    getAuthorCounts: async () => {
      try {
        const rows = await prisma.books.groupBy({
          by: ['author'],
          where: { AND: [VISIBLE_BOOK_WHERE, { author: { not: null } }] },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 50,
        });
        const data = rows.filter((r) => r.author).map((r) => ({ author: r.author!, count: r._count.id }));
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    getPublisherCounts: async () => {
      try {
        const rows = await prisma.books.groupBy({
          by: ['publisher'],
          where: { AND: [VISIBLE_BOOK_WHERE, { publisher: { not: null } }] },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 50,
        });
        const data = rows.filter((r) => r.publisher).map((r) => ({ publisher: r.publisher!, count: r._count.id }));
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  },

  // Bestsellers operations
  bestsellers: {
    getAll: async (page = 1, limit = 30) => {
      try {
        const offset = (page - 1) * limit;
        // Fetch all active bestsellers with their books (matching admin panel behavior)
        const allRows = await prisma.bestseller_books.findMany({
          where: { status: 'active' },
          include: {
            book: {
              select: {
                id: true,
                title: true,
                author: true,
                asin: true,
                cover_image_url: true,
                inr_price: true,
                main_genre: true,
                selling_price_inr: true,
                publisher: true,
                status: true,
              },
            },
          },
          orderBy: [{ added_date: 'desc' }, { sort_order: 'asc' }],
        });
        // Filter to only include visible books (status null, empty, or 'active')
        const visibleRows = allRows.filter((r) => {
          const bookStatus = r.book?.status;
          return !bookStatus || bookStatus === 'active' || bookStatus === '';
        });
        const total = visibleRows.length;
        const paginatedRows = visibleRows.slice(offset, offset + limit);
        const data = paginatedRows.map((r) => ({
          id: r.book.id,
          title: r.book.title,
          author: r.book.author,
          asin: r.book.asin,
          cover_image_url: r.book.cover_image_url,
          inr_price: r.book.inr_price,
          selling_price_inr: r.book.selling_price_inr,
          main_genre: r.book.main_genre,
          publisher: r.book.publisher,
          sort_order: r.sort_order,
          total_count: total,
        }));
        return { data, error: null, count: total };
      } catch (error) {
        console.error('Error in bestsellers.getAll:', error);
        return { data: null, error, count: 0 };
      }
    },

    addByASIN: async (asin: string) => {
      try {
        const book = await prisma.books.findFirst({ where: { asin } });
        if (!book) return { data: null, error: new Error('Book not found') };
        const existing = await prisma.bestseller_books.findFirst({ where: { book_id: book.id, status: 'active' } });
        if (existing) return { data: { added: false }, error: null };
        const maxOrder = await prisma.bestseller_books.aggregate({ _max: { sort_order: true }, where: { status: 'active' } });
        await prisma.bestseller_books.create({
          data: { book_id: book.id, asin: book.asin ?? undefined, title: book.title, author: book.author, sort_order: (maxOrder._max.sort_order ?? 0) + 1, status: 'active' },
        });
        return { data: { added: true }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    removeByASIN: async (asin: string) => {
      try {
        const book = await prisma.books.findFirst({ where: { asin } });
        if (!book) return { data: null, error: new Error('Book not found') };
        await prisma.bestseller_books.updateMany({
          where: { book_id: book.id, status: 'active' },
          data: { status: 'inactive' },
        });
        return { data: { removed: true }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Additional bestseller functions for admin
    getManagementData: async () => {
      try {
        const data = await prisma.bestseller_books.findMany({
          where: { status: 'active' },
          include: { book: true },
          orderBy: { added_date: 'desc' }
        });
        
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  },

  // Deals operations (daily_deals has asin; join to books in app)
  deals: {
    getAll: async (page = 1, limit = 30) => {
      try {
        const offset = (page - 1) * limit;
        const deals = await prisma.daily_deals.findMany({
          where: { status: 'active' },
          orderBy: [{ is_fixed_position: 'desc' }, { position: 'asc' }, { created_at: 'desc' }],
        });
        const asins = deals.map((d) => d.asin).filter(Boolean);
        // Only include visible books (status null, empty, or active)
        const books = asins.length
          ? await prisma.books.findMany({
              where: {
                AND: [{ asin: { in: asins } }, VISIBLE_BOOK_WHERE],
              },
            })
          : [];
        const bookByAsin = Object.fromEntries(books.map((b) => [b.asin, b]));
        // Only include deals where the linked book is visible
        const visibleDeals = deals.filter((d) => d.asin && bookByAsin[d.asin]);
        const total = visibleDeals.length;
        const paginatedDeals = visibleDeals.slice(offset, offset + limit);
        const data = paginatedDeals.map((d, index) => {
          const book = d.asin ? bookByAsin[d.asin] : null;
          return {
            id: d.id,
            asin: d.asin,
            position: offset + index + 1,
            status: d.status,
            is_top_six: d.is_top_six,
            is_fixed_position: d.is_fixed_position,
            created_at: d.created_at,
            book_title: book?.title ?? null,
            book_author: book?.author ?? null,
            book_asin: book?.asin ?? d.asin,
            book_cover_image_url: book?.cover_image_url ?? null,
            book_inr_price: book?.inr_price ?? null,
          };
        });
        return { data, error: null, count: total };
      } catch (error) {
        console.error('Error in deals.getAll:', error);
        return { data: null, error, count: 0 };
      }
    },

    getForBook: async (bookASIN: string) => {
      try {
        const deals = await prisma.daily_deals.findMany({
          where: { status: 'active', asin: bookASIN },
          orderBy: [{ position: 'asc' }, { created_at: 'desc' }],
        });
        const book = await prisma.books.findFirst({
          where: { AND: [{ asin: bookASIN }, VISIBLE_BOOK_WHERE] },
        });
        // If the book is not visible, return empty
        if (!book) return { data: [], error: null };
        const data = deals.map((d) => ({
          id: d.id,
          asin: d.asin,
          position: d.position,
          status: d.status,
          is_top_six: d.is_top_six,
          is_fixed_position: d.is_fixed_position,
          created_at: d.created_at,
          book_title: book.title ?? null,
          book_author: book.author ?? null,
          book_asin: book.asin ?? d.asin,
          book_cover_image_url: book.cover_image_url ?? null,
          book_inr_price: book.inr_price ?? null,
        }));
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    getStats: async () => {
      try {
        const [totalDeals, topSixDeals, fixedPositionDeals] = await Promise.all([
          prisma.daily_deals.count({ where: { status: 'active' } }),
          prisma.daily_deals.count({ where: { status: 'active', is_top_six: true } }),
          prisma.daily_deals.count({ where: { status: 'active', is_fixed_position: true } }),
        ]);
        return {
          data: { totalDeals, topSixDeals, fixedPositionDeals },
          error: null,
        };
      } catch (error) {
        return { data: { totalDeals: 0, topSixDeals: 0, fixedPositionDeals: 0 }, error };
      }
    },

    // Additional deals functions for admin
    create: async (dealData: any) => {
      try {
        const result = await prisma.daily_deals.create({
          data: dealData
        });
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    update: async (id: string, dealData: any) => {
      try {
        const result = await prisma.daily_deals.update({
          where: { id },
          data: dealData
        });
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    delete: async (id: string) => {
      try {
        const result = await prisma.daily_deals.delete({
          where: { id }
        });
        return { data: result, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    checkExisting: async (asin: string) => {
      try {
        const data = await prisma.daily_deals.findMany({
          where: { asin }
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    getMaxPosition: async () => {
      try {
        const result = await prisma.daily_deals.findFirst({
          orderBy: { position: 'desc' },
          select: { position: true }
        });
        return { data: result?.position || 0, error: null };
      } catch (error) {
        return { data: 0, error };
      }
    },

    getAllPositions: async () => {
      try {
        const data = await prisma.daily_deals.findMany({
          select: { position: true }
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Bulk add deals
    bulkAdd: async (deals: any[]) => {
      try {
        const results = await prisma.daily_deals.createMany({
          data: deals,
          skipDuplicates: true
        });
        return { data: results, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  },

  // Admin operations
  admin: {
    // Get all admin users
    getAll: async () => {
      try {
        const data = await prisma.admin_users.findMany({
          orderBy: { created_at: 'desc' }
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Create new admin user
    create: async (email: string, password: string) => {
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const data = await prisma.admin_users.create({
          data: {
            id: crypto.randomUUID(),
            email: email.trim(),
            password_hash: hashedPassword
          }
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Verify admin login
    verifyLogin: async (email: string, password: string) => {
      try {
        
        const admin = await prisma.admin_users.findFirst({
          where: { email: email.trim() }
        });
        
        if (!admin) {
          return { data: null, error: { message: 'Invalid email or password' } };
        }
        
        if (!admin.password_hash) {
          return { data: null, error: { message: 'Password not set for this account' } };
        }
        
        const isValidPassword = await bcrypt.compare(password, admin.password_hash);
        
        if (!isValidPassword) {
          return { data: null, error: { message: 'Invalid email or password' } };
        }
        
        return { data: admin, error: null };
      } catch (error) {
        return { data: null, error: { message: 'Authentication failed' } };
      }
    },

    // Delete admin user
    delete: async (adminId: string) => {
      try {
        await prisma.admin_users.delete({
          where: { id: adminId }
        });
        return { error: null };
      } catch (error) {
        return { error };
      }
    },

    // Update admin email
    updateEmail: async (adminId: string, newEmail: string) => {
      try {
        const data = await prisma.admin_users.update({
          where: { id: adminId },
          data: { email: newEmail.trim() }
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Update admin password
    updatePassword: async (adminId: string, newPassword: string) => {
      try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        const data = await prisma.admin_users.update({
          where: { id: adminId },
          data: { password_hash: hashedPassword }
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Check if user is admin
    checkAdmin: async (userId: string) => {
      try {
        const admin = await prisma.admin_users.findUnique({
          where: { id: userId }
        });
        return { data: admin, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  },

  // Book management operations
  bookManagement: {
    // Delete a book
    delete: async (bookId: string) => {
      try {
        await prisma.books.delete({
          where: { id: bookId }
        });
        return { error: null };
      } catch (error) {
        return { error };
      }
    },

    // Update book status
    updateStatus: async (bookId: string, status: string) => {
      try {
        const data = await prisma.books.update({
          where: { id: bookId },
          data: { status }
        });
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Get today's upload count
    getTodayUploadCount: async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const count = await prisma.books.count({
          where: {
            created_at: {
              gte: today
            }
          }
        });
        
        return { count, error: null };
      } catch (error) {
        return { count: 0, error };
      }
    },

    // Get unique authors count
    getUniqueAuthorsCount: async () => {
      try {
        const books = await prisma.books.findMany({
          where: VISIBLE_BOOK_WHERE,
          select: {
            author: true,
            second_author_narrator: true,
            author_3: true
          }
        });
        
        const authorSet = new Set<string>();
        books.forEach(book => {
          if (book.author) authorSet.add(book.author);
          if (book.second_author_narrator) authorSet.add(book.second_author_narrator);
          if (book.author_3) authorSet.add(book.author_3);
        });
        
        return { count: authorSet.size, error: null };
      } catch (error) {
        return { count: 0, error };
      }
    },

    // Get unique categories count
    getUniqueCategoriesCount: async () => {
      try {
        const books = await prisma.books.findMany({
          where: VISIBLE_BOOK_WHERE,
          select: {
            main_genre: true,
            genre_2: true,
            genre_3: true,
            subject_category_1: true,
            subject_category_2: true
          }
        });
        
        const categorySet = new Set<string>();
        books.forEach(book => {
          if (book.main_genre) categorySet.add(book.main_genre);
          if (book.genre_2) categorySet.add(book.genre_2);
          if (book.genre_3) categorySet.add(book.genre_3);
          if (book.subject_category_1) categorySet.add(book.subject_category_1);
          if (book.subject_category_2) categorySet.add(book.subject_category_2);
        });
        
        return { count: categorySet.size, error: null };
      } catch (error) {
        return { count: 0, error };
      }
    },

    // Get unique publishers count
    getUniquePublishersCount: async () => {
      try {
        const books = await prisma.books.findMany({
          where: {
            AND: [VISIBLE_BOOK_WHERE, { publisher: { not: null } }]
          },
          select: {
            publisher: true
          }
        });
        
        const publisherSet = new Set<string>();
        books.forEach(book => {
          if (book.publisher) publisherSet.add(book.publisher);
        });
        
        return { count: publisherSet.size, error: null };
      } catch (error) {
        return { count: 0, error };
      }
    },

    // Search books with filters
    search: async (filters: {
      search_term?: string;
      genre_filter?: string;
      author_filter?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => {
      try {
        const page = filters.page || 1;
        const limit = filters.limit || 50;
        const offset = (page - 1) * limit;
        
        const whereClause: any = {};
        
        // Build where clause based on filters
        const orConditions = [];
        
        if (filters.search_term) {
          orConditions.push(
            { title: { contains: filters.search_term } },
            { author: { contains: filters.search_term } },
            { isbn: { contains: filters.search_term } },
            { asin: { contains: filters.search_term } }
          );
        }
        
        if (filters.genre_filter) {
          orConditions.push(
            { main_genre: filters.genre_filter },
            { genre_2: filters.genre_filter },
            { genre_3: filters.genre_filter },
            { subject_category_1: filters.genre_filter },
            { subject_category_2: filters.genre_filter }
          );
        }
        
        if (filters.author_filter) {
          orConditions.push(
            { author: { contains: filters.author_filter } },
            { second_author_narrator: { contains: filters.author_filter } },
            { author_3: { contains: filters.author_filter } }
          );
        }
        
        if (orConditions.length > 0) {
          whereClause.OR = orConditions;
        }
        
        if (filters.status) {
          whereClause.status = filters.status;
        }
        
        const data = await prisma.books.findMany({
          where: whereClause,
          skip: offset,
          take: limit,
          orderBy: { created_at: 'desc' }
        });
        
        const total = await prisma.books.count({
          where: whereClause
        });
        
        return { data, error: null, total };
      } catch (error) {
        return { data: null, error, total: 0 };
      }
    },

    // Get unique genres for filters
    getUniqueGenres: async () => {
      try {
        const books = await prisma.books.findMany({
          where: VISIBLE_BOOK_WHERE,
          select: {
            main_genre: true,
            genre_2: true,
            genre_3: true,
            subject_category_1: true,
            subject_category_2: true
          }
        });
        
        const genreSet = new Set<string>();
        books.forEach(book => {
          if (book.main_genre) genreSet.add(book.main_genre);
          if (book.genre_2) genreSet.add(book.genre_2);
          if (book.genre_3) genreSet.add(book.genre_3);
          if (book.subject_category_1) genreSet.add(book.subject_category_1);
          if (book.subject_category_2) genreSet.add(book.subject_category_2);
        });
        
        return { data: Array.from(genreSet).sort(), error: null };
      } catch (error) {
        return { data: [], error };
      }
    },

    // Get unique authors for filters
    getUniqueAuthors: async () => {
      try {
        const books = await prisma.books.findMany({
          where: VISIBLE_BOOK_WHERE,
          select: {
            author: true,
            second_author_narrator: true,
            author_3: true
          }
        });
        
        const authorSet = new Set<string>();
        books.forEach(book => {
          if (book.author) authorSet.add(book.author);
          if (book.second_author_narrator) authorSet.add(book.second_author_narrator);
          if (book.author_3) authorSet.add(book.author_3);
        });
        
        return { data: Array.from(authorSet).sort(), error: null };
      } catch (error) {
        return { data: [], error };
      }
    },

    // Get unique publishers for filters
    getUniquePublishers: async () => {
      try {
        const books = await prisma.books.findMany({
          where: { AND: [VISIBLE_BOOK_WHERE, { publisher: { not: null } }] },
          select: {
            publisher: true
          }
        });
        
        const publisherSet = new Set<string>();
        books.forEach(book => {
          if (book.publisher) publisherSet.add(book.publisher);
        });
        
        return { data: Array.from(publisherSet).sort(), error: null };
      } catch (error) {
        return { data: [], error };
      }
    },

    // Get total count of books
    getTotalCount: async () => {
      try {
        const count = await prisma.books.count();
        return { data: count, error: null };
      } catch (error) {
        return { data: 0, error };
      }
    }
  },

  auth: {
    signUp: async (credentials: { email: string; password: string }) => {
      return { data: { user: null }, error: null };
    },
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      return { data: { user: null }, error: null };
    },
    signOut: async () => {
      return { error: null };
    },
    getSession: async () => {
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },

  // Bulk upload operations
  bulkUpload: {
    // Validate book data
    validateData: async (books: any[]) => {
      try {
        const validationResults = [];
        
        for (const book of books) {
          const errors = [];
          
          // Basic validation
          if (!book.title) errors.push('Title is required');
          if (!book.author) errors.push('Author is required');
          if (!book.main_genre) errors.push('Genre is required');
          
          // Check for duplicate ASIN if provided
          if (book.asin) {
            const existingBook = await prisma.books.findFirst({
              where: { asin: book.asin }
            });
            
            if (existingBook) {
              errors.push('ASIN already exists');
            }
          }
          
          // Check for duplicate ISBN if provided
          if (book.isbn) {
            const existingBook = await prisma.books.findFirst({
              where: { isbn: book.isbn }
            });
            
            if (existingBook) {
              errors.push('ISBN already exists');
            }
          }
          
          validationResults.push({
            book,
            isValid: errors.length === 0,
            errors
          });
        }
        
        return { data: validationResults, error: null };
      } catch (error) {
        console.error('Validation error:', error);
        return { data: null, error };
      }
    },

    // Batch insert books
    batchInsert: async (books: any[]) => {
      try {
        const results = await prisma.books.createMany({
          data: books,
          skipDuplicates: true
        });
        return { data: results, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Get upload progress (placeholder for future implementation)
    getProgress: async () => {
      try {
        // This would typically track progress in a separate table
        return { data: { processed: 0, total: 0, status: 'idle' }, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  },

  // Export operations
  export: {
    // Export books with filters
    books: async (filters: {
      status?: string;
      genre?: string;
      author?: string;
      publisher?: string;
      limit?: number;
    } = {}) => {
      try {
        const whereClause: any = {};
        
        // Status filter
        if (filters.status && filters.status !== 'all') {
          whereClause.status = filters.status;
        }
        
        // Genre filter - simple like backup app
        if (filters.genre && filters.genre !== 'all') {
          whereClause.main_genre = filters.genre;
        }
        
        // Author filter - simple like backup app
        if (filters.author) {
          whereClause.author = { contains: filters.author };
        }
        
        // Publisher filter - simple like backup app
        if (filters.publisher) {
          whereClause.publisher = { contains: filters.publisher };
        }
        
        const data = await prisma.books.findMany({
          where: whereClause,
          take: filters.limit || 1000,
          orderBy: { created_at: 'desc' }
        });
        
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Export deals
    deals: async (filters: {
      status?: string;
      limit?: number;
    } = {}) => {
      try {
        const whereClause: any = {};
        
        if (filters.status) whereClause.status = filters.status;
        
        const data = await prisma.daily_deals.findMany({
          where: whereClause,
          take: filters.limit || 1000,
          orderBy: { created_at: 'desc' }
        });
        
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },

    // Export bestsellers
    bestsellers: async (filters: {
      status?: string;
      limit?: number;
    } = {}) => {
      try {
        const whereClause: any = {};
        
        if (filters.status) whereClause.status = filters.status;
        
        const data = await prisma.bestseller_books.findMany({
          where: whereClause,
          take: filters.limit || 1000,
          orderBy: { added_date: 'desc' },
          include: { book: true }
        });
        
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }
  }
};


