export interface Book {
  id?: string | null;
  // Core fields - these come from database and can be null
  title?: string | null; // Title from database (can be null)
  main_genre?: string | null; // Main genre from database (can be null)
  // Either ASIN or ISBN should be present (at least one identifier)
  asin?: string | null; // ASIN (Amazon Standard Identification Number)
  isbn?: string | null; // ISBN-13
  isbn_10?: string | null;
  author?: string | null;
  second_author_narrator?: string | null;
  author_3?: string | null;
  inr_price?: number | any; // Allow Decimal from Prisma
  selling_price_inr?: number | any; // Allow Decimal from Prisma
  cover_image_url?: string | null;
  subject_category_1?: string | null;
  subject_category_2?: string | null;
  genre_2?: string | null;
  genre_3?: string | null;
  book_format?: string | null;
  publisher?: string | null;
  language?: string | null;
  publication_date?: string | null;
  page_count?: number | null;
  usd_price?: number | any; // Allow Decimal from Prisma
  best_seller_rank?: number | null;
  description?: string | null;
  publishing_group?: string | null;
  about_the_author?: string | null;
  book_excerpts?: string | null;
  related_tags_keywords?: string[] | null;
  edition?: string | null;
  weight?: string | null;
  dimensions?: string | null;
  series_name?: string | null;
  book_award?: string | null;
  bisac_codes?: string[] | null;
  paperback_isbn?: string | null;
  hardcover_isbn?: string | null;
  ebook_isbn?: string | null;
  audiobook_isbn?: string | null;
  place_of_origin?: string | null;
  trade_distributor?: string | null;
  goodreads_book_page_url?: string | null;
  youtube_video_url?: string | null;
  author_website_url?: string | null;
  publisher_website_url?: string | null;
  status_on_front?: string | null;
  page_title?: string | null;
  meta_keywords?: string[] | null;
  meta_description?: string | null;
  buy_now_box_content?: string | null;
  affiliate_store_1_url?: string | null;
  affiliate_store_2_url?: string | null;
  affiliate_store_3_url?: string | null;
  affiliate_store_4_url?: string | null;
  affiliate_store_5_url?: string | null;
  affiliate_store_6_url?: string | null;
  affiliate_store_7_url?: string | null;
  affiliate_store_8_url?: string | null;
  search_keywords?: string[] | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  bullet_text_1?: string | null;
  bullet_text_2?: string | null;
  bullet_text_3?: string | null;
  bullet_text_4?: string | null;
  bullet_text_5?: string | null;
  status?: string | null;
  is_fixed_position?: boolean | null;
}

// Utility types for better type safety
export type BookRequired = Required<Pick<Book, 'title' | 'main_genre'>>;
export type BookOptional = Omit<Book, keyof BookRequired>;

// Validation function to ensure book has required fields
export function validateBook(book: Partial<Book>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check that at least one identifier is present
  if (!book.asin && !book.isbn && !book.isbn_10) {
    errors.push('At least one identifier (ASIN, ISBN-13, or ISBN-10) is required');
  }

  // Note: Title and main_genre can be null in the database
  // Validation for these should be done at the application level when creating/updating books

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Utility function to safely get book title
export function getBookTitle(book: Book): string {
  return book.title || 'Untitled Book';
}

// Utility function to safely get book genre
export function getBookGenre(book: Book): string {
  return book.main_genre || 'Uncategorized';
}

// Utility function to safely get book author
export function getBookAuthor(book: Book): string {
  return book.author || 'Unknown Author';
}

// Utility function to safely get book cover image
export function getBookCover(book: Book): string {
  return book.cover_image_url || '/placeholder.svg';
} 