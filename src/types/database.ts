// Database Types for Allbooks Next.js Application
// Generated from production schema

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          title: string
          author: string | null
          asin: string
          isbn: string | null
          isbn_10: string | null
          publisher: string | null
          language: string | null
          publication_date: string | null
          page_count: number | null
          inr_price: number | null
          usd_price: number | null
          selling_price_inr: number | null
          best_seller_rank: number | null
          cover_image_url: string | null
          description: string | null
          book_format: string | null
          publishing_group: string | null
          about_the_author: string | null
          book_excerpts: string | null
          related_tags_keywords: string[] | null
          edition: string | null
          weight: string | null
          dimensions: string | null
          second_author_narrator: string | null
          author_3: string | null
          series_name: string | null
          book_award: string | null
          bisac_codes: string[] | null
          paperback_isbn: string | null
          hardcover_isbn: string | null
          ebook_isbn: string | null
          audiobook_isbn: string | null
          place_of_origin: string | null
          trade_distributor: string | null
          goodreads_book_page_url: string | null
          youtube_video_url: string | null
          author_website_url: string | null
          publisher_website_url: string | null
          status_on_front: string | null
          page_title: string | null
          meta_keywords: string[] | null
          meta_description: string | null
          buy_now_box_content: string | null
          affiliate_store_1_url: string | null
          affiliate_store_2_url: string | null
          affiliate_store_3_url: string | null
          affiliate_store_4_url: string | null
          affiliate_store_5_url: string | null
          affiliate_store_6_url: string | null
          affiliate_store_7_url: string | null
          affiliate_store_8_url: string | null
          search_keywords: string[] | null
          main_genre: string | null
          genre_2: string | null
          genre_3: string | null
          subject_category_1: string | null
          subject_category_2: string | null
          bullet_text_1: string | null
          bullet_text_2: string | null
          bullet_text_3: string | null
          bullet_text_4: string | null
          bullet_text_5: string | null
          status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          author?: string | null
          asin: string
          isbn?: string | null
          isbn_10?: string | null
          publisher?: string | null
          language?: string | null
          publication_date?: string | null
          page_count?: number | null
          inr_price?: number | null
          usd_price?: number | null
          selling_price_inr?: number | null
          best_seller_rank?: number | null
          cover_image_url?: string | null
          description?: string | null
          book_format?: string | null
          publishing_group?: string | null
          about_the_author?: string | null
          book_excerpts?: string | null
          related_tags_keywords?: string[] | null
          edition?: string | null
          weight?: string | null
          dimensions?: string | null
          second_author_narrator?: string | null
          author_3?: string | null
          series_name?: string | null
          book_award?: string | null
          bisac_codes?: string[] | null
          paperback_isbn?: string | null
          hardcover_isbn?: string | null
          ebook_isbn?: string | null
          audiobook_isbn?: string | null
          place_of_origin?: string | null
          trade_distributor?: string | null
          goodreads_book_page_url?: string | null
          youtube_video_url?: string | null
          author_website_url?: string | null
          publisher_website_url?: string | null
          status_on_front?: string | null
          page_title?: string | null
          meta_keywords?: string[] | null
          meta_description?: string | null
          buy_now_box_content?: string | null
          affiliate_store_1_url?: string | null
          affiliate_store_2_url?: string | null
          affiliate_store_3_url?: string | null
          affiliate_store_4_url?: string | null
          affiliate_store_5_url?: string | null
          affiliate_store_6_url?: string | null
          affiliate_store_7_url?: string | null
          affiliate_store_8_url?: string | null
          search_keywords?: string[] | null
          main_genre?: string | null
          genre_2?: string | null
          genre_3?: string | null
          subject_category_1?: string | null
          subject_category_2?: string | null
          bullet_text_1?: string | null
          bullet_text_2?: string | null
          bullet_text_3?: string | null
          bullet_text_4?: string | null
          bullet_text_5?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string | null
          asin?: string
          isbn?: string | null
          isbn_10?: string | null
          publisher?: string | null
          language?: string | null
          publication_date?: string | null
          page_count?: number | null
          inr_price?: number | null
          usd_price?: number | null
          selling_price_inr?: number | null
          best_seller_rank?: number | null
          cover_image_url?: string | null
          description?: string | null
          book_format?: string | null
          publishing_group?: string | null
          about_the_author?: string | null
          book_excerpts?: string | null
          related_tags_keywords?: string[] | null
          edition?: string | null
          weight?: string | null
          dimensions?: string | null
          second_author_narrator?: string | null
          author_3?: string | null
          series_name?: string | null
          book_award?: string | null
          bisac_codes?: string[] | null
          paperback_isbn?: string | null
          hardcover_isbn?: string | null
          ebook_isbn?: string | null
          audiobook_isbn?: string | null
          place_of_origin?: string | null
          trade_distributor?: string | null
          goodreads_book_page_url?: string | null
          youtube_video_url?: string | null
          author_website_url?: string | null
          publisher_website_url?: string | null
          status_on_front?: string | null
          page_title?: string | null
          meta_keywords?: string[] | null
          meta_description?: string | null
          buy_now_box_content?: string | null
          affiliate_store_1_url?: string | null
          affiliate_store_2_url?: string | null
          affiliate_store_3_url?: string | null
          affiliate_store_4_url?: string | null
          affiliate_store_5_url?: string | null
          affiliate_store_6_url?: string | null
          affiliate_store_7_url?: string | null
          affiliate_store_8_url?: string | null
          search_keywords?: string[] | null
          main_genre?: string | null
          genre_2?: string | null
          genre_3?: string | null
          subject_category_1?: string | null
          subject_category_2?: string | null
          bullet_text_1?: string | null
          bullet_text_2?: string | null
          bullet_text_3?: string | null
          bullet_text_4?: string | null
          bullet_text_5?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      bestseller_books: {
        Row: {
          id: string
          book_id: string
          asin: string
          title: string
          author: string | null
          added_date: string
          sort_order: number | null
          status: string | null
        }
        Insert: {
          id?: string
          book_id: string
          asin: string
          title: string
          author?: string | null
          added_date?: string
          sort_order?: number | null
          status?: string | null
        }
        Update: {
          id?: string
          book_id?: string
          asin?: string
          title?: string
          author?: string | null
          added_date?: string
          sort_order?: number | null
          status?: string | null
        }
      }
      daily_deals: {
        Row: {
          id: string
          asin: string
          position: number
          is_top_six: boolean
          is_fixed_position: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asin: string
          position?: number
          is_top_six?: boolean
          is_fixed_position?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asin?: string
          position?: number
          is_top_six?: boolean
          is_fixed_position?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_bestseller_by_asin: {
        Args: { book_asin: string }
        Returns: boolean
      }
      filter_books: {
        Args: {
          genre_filter?: string
          author_filter?: string
          language_filter?: string
          min_price?: number
          max_price?: number
          sort_by?: string
          sort_order?: string
          page_limit?: number
          page_offset?: number
          publisher_filter?: string
          subject_filter?: string
          tag_filter?: string
        }
        Returns: {
          id: string
          title: string
          main_genre: string
          asin: string
          author: string
          isbn: string
          publisher: string
          language: string
          publication_date: string
          page_count: number
          inr_price: number
          usd_price: number
          best_seller_rank: number
          cover_image_url: string
          description: string
          book_format: string
          publishing_group: string
          about_the_author: string
          book_excerpts: string
          related_tags_keywords: string[]
          edition: string
          weight: string
          dimensions: string
          second_author_narrator: string
          series_name: string
          book_award: string
          bisac_codes: string[]
          paperback_isbn: string
          hardcover_isbn: string
          ebook_isbn: string
          audiobook_isbn: string
          place_of_origin: string
          trade_distributor: string
          goodreads_book_page_url: string
          youtube_video_url: string
          author_website_url: string
          publisher_website_url: string
          status_on_front: string
          page_title: string
          meta_keywords: string[]
          meta_description: string
          buy_now_box_content: string
          affiliate_store_1_url: string
          affiliate_store_2_url: string
          affiliate_store_3_url: string
          affiliate_store_4_url: string
          affiliate_store_5_url: string
          affiliate_store_6_url: string
          affiliate_store_7_url: string
          affiliate_store_8_url: string
          search_keywords: string[]
          created_at: string
          updated_at: string
          selling_price_inr: number
          isbn_10: string
          author_3: string
          subject_category_1: string
          subject_category_2: string
          genre_2: string
          genre_3: string
          bullet_text_1: string
          bullet_text_2: string
          bullet_text_3: string
          bullet_text_4: string
          bullet_text_5: string
          status: string
          total_count: number
        }[]
      }
      get_all_daily_deals: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          asin: string
          position: number
          is_top_six: boolean
          is_fixed_position: boolean
          created_at: string
          book_data: unknown
        }[]
      }
      get_author_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          author_name: string
          book_count: number
        }[]
      }
      get_bestseller_books: {
        Args: {
          page_limit?: number
          page_offset?: number
        }
        Returns: {
          id: string
          title: string
          author: string
          asin: string
          cover_image_url: string
          inr_price: number
          selling_price_inr: number
          main_genre: string
          publisher: string
          added_date: string
          sort_order: number
          total_count: number
        }[]
      }
      get_category_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          count: number
        }[]
      }
      get_publisher_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          publisher_name: string
          book_count: number
        }[]
      }
      get_daily_deals_for_book: {
        Args: { target_asin: string }
        Returns: {
          id: string
          asin: string
          position: number
          is_top_six: boolean
          is_fixed_position: boolean
          book_data: unknown
        }[]
      }
      get_similar_books: {
        Args: {
          current_book_id?: string
          current_title?: string
          current_author?: string
          current_genre?: string
          current_asin?: string
          max_results?: number
        }
        Returns: {
          id: string
          title: string
          author: string
          asin: string
          cover_image_url: string
          inr_price: number
          selling_price_inr: number
          main_genre: string
          publisher: string
          similarity_score: number
          match_type: string
        }[]
      }
      remove_bestseller_by_asin: {
        Args: { book_asin: string }
        Returns: boolean
      }
      search_books: {
        Args: {
          search_term: string
          page_limit?: number
          page_offset?: number
          status?: string
        }
        Returns: {
          id: string
          title: string
          author: string
          asin: string
          cover_image_url: string
          inr_price: number
          selling_price_inr: number
          main_genre: string
          publisher: string
          total_count: number
        }[]
      }
      verify_admin_login: {
        Args: {
          p_login_id: string
          p_password_hash: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type helpers for common operations
export type Book = Database['public']['Tables']['books']['Row']
export type BookInsert = Database['public']['Tables']['books']['Insert']
export type BookUpdate = Database['public']['Tables']['books']['Update']

export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type AdminUserInsert = Database['public']['Tables']['admin_users']['Insert']
export type AdminUserUpdate = Database['public']['Tables']['admin_users']['Update']

export type BestsellerBook = Database['public']['Tables']['bestseller_books']['Row']
export type BestsellerBookInsert = Database['public']['Tables']['bestseller_books']['Insert']
export type BestsellerBookUpdate = Database['public']['Tables']['bestseller_books']['Update']

export type DailyDeal = Database['public']['Tables']['daily_deals']['Row']
export type DailyDealInsert = Database['public']['Tables']['daily_deals']['Insert']
export type DailyDealUpdate = Database['public']['Tables']['daily_deals']['Update'] 