/**
 * Cache invalidation utility for the application
 * Handles invalidation of both page caches and data caches
 */

export interface CacheInvalidationOptions {
  invalidatePages?: boolean;
  invalidateData?: boolean;
  invalidateAll?: boolean;
}

/**
 * Invalidate all caches related to books
 * This should be called after any book-related operations (upload, update, delete)
 */
export async function invalidateBookCaches(options: CacheInvalidationOptions = {}) {
  const { invalidatePages = true, invalidateData = true, invalidateAll = false } = options;

  try {
    console.log('🔄 Starting cache invalidation...');

    const paths: string[] = [];
    const tags: string[] = [];

    if (invalidateAll || invalidatePages) {
      // Add page paths to invalidate
      paths.push(
        '/', // Homepage
        '/bestsellers', // Bestsellers page
        '/new-releases', // New releases page
        '/just-listed', // Just listed page
        '/categories', // Categories page
        '/authors', // Authors page
        '/daily-deals', // Daily deals page
        '/search' // Search page
      );
    }

    if (invalidateAll || invalidateData) {
      // Add data tags to invalidate
      tags.push(
        'bestsellers',
        'new-releases',
        'just-listed',
        'daily-deals',
        'genres',
        'authors',
        'book-details',
        'similar-books'
      );
    }

    // Call the cache invalidation API
    const response = await fetch('/api/cache/invalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paths, tags }),
    });

    if (!response.ok) {
      throw new Error(`Cache invalidation failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Cache invalidation completed successfully:', result);

  } catch (error) {
    console.error('❌ Cache invalidation failed:', error);
    // Don't throw error - cache invalidation failure shouldn't break the upload
  }
}

/**
 * Invalidate specific page cache
 */
export async function invalidatePage(path: string) {
  try {
    const response = await fetch('/api/cache/invalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paths: [path] }),
    });

    if (!response.ok) {
      throw new Error(`Failed to invalidate page cache: ${response.status}`);
    }

    console.log(`✅ Page cache invalidated: ${path}`);
  } catch (error) {
    console.error(`❌ Failed to invalidate page cache: ${path}`, error);
  }
}

/**
 * Invalidate specific data cache by tag
 */
export async function invalidateDataByTag(tag: string) {
  try {
    const response = await fetch('/api/cache/invalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags: [tag] }),
    });

    if (!response.ok) {
      throw new Error(`Failed to invalidate data cache: ${response.status}`);
    }

    console.log(`✅ Data cache invalidated: ${tag}`);
  } catch (error) {
    console.error(`❌ Failed to invalidate data cache: ${tag}`, error);
  }
}

/**
 * Invalidate caches for specific book operations
 */
export async function invalidateBookOperationCaches(operation: 'upload' | 'update' | 'delete') {
  const cacheOptions: CacheInvalidationOptions = {
    invalidatePages: true,
    invalidateData: true,
  };

  await invalidateBookCaches(cacheOptions);
  console.log(`✅ Caches invalidated for book ${operation} operation`);
} 