import { prisma } from '@/lib/prisma';

// Get bestseller books
export const getBestsellerBooks = async () => {
  try {
    const data = await prisma.bestseller_books.findMany({
      where: {
        status: 'active'
      },
      include: {
        book: true
      },
      orderBy: {
        sort_order: 'asc'
      }
    });
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching bestseller books:', error);
    return { data: null, error };
  }
};

// Add book to bestsellers
export const addBestseller = async (asin: string, position?: number) => {
  try {
    // First check if the book exists
    const book = await prisma.books.findFirst({
      where: { asin }
    });

    if (!book) {
      return { error: { message: 'Book not found in database' } };
    }

    // Check if already a bestseller
    const existingBestseller = await prisma.bestseller_books.findFirst({
      where: { 
        asin,
        status: 'active'
      }
    });

    if (existingBestseller) {
      return { error: { message: 'Book is already a bestseller' } };
    }

    // Get the next position if not provided
    let nextPosition = position;
    if (!nextPosition) {
      const maxPositionBook = await prisma.bestseller_books.findFirst({
        where: { status: 'active' },
        orderBy: { sort_order: 'desc' },
        select: { sort_order: true }
      });

      nextPosition = maxPositionBook?.sort_order 
        ? (maxPositionBook.sort_order || 0) + 1 
        : 1;
    }

    // Add to bestseller_books table
    const newBestseller = await prisma.bestseller_books.create({
      data: {
        book_id: book.id,
        asin: book.asin,
        title: book.title,
        author: book.author,
        sort_order: nextPosition,
        status: 'active'
      },
      include: {
        book: true
      }
    });

    return { data: newBestseller, error: null };
  } catch (error) {
    console.error('Error adding bestseller:', error);
    return { error: { message: 'Failed to add bestseller' } };
  }
};

// Remove book from bestsellers
export const removeBestseller = async (asin: string) => {
  try {
    await prisma.bestseller_books.updateMany({
      where: { 
        asin,
        status: 'active'
      },
      data: { 
        status: 'inactive'
      }
    });

    return { error: null };
  } catch (error) {
    console.error('Error removing bestseller:', error);
    return { error: { message: 'Failed to remove bestseller' } };
  }
};

// Update bestseller position
export const updateBestsellerPosition = async (asin: string, position: number) => {
  try {
    await prisma.bestseller_books.updateMany({
      where: { 
        asin,
        status: 'active'
      },
      data: { 
        sort_order: position
      }
    });

    return { error: null };
  } catch (error) {
    console.error('Error updating bestseller position:', error);
    return { error: { message: 'Failed to update bestseller position' } };
  }
};

// Bulk add bestsellers
export const bulkAddBestsellers = async (asins: string[]) => {
  const results = {
    validCount: 0,
    totalCount: asins.length,
    errors: [] as string[]
  };

  for (const asin of asins) {
    const result = await addBestseller(asin);
    if (result.error) {
      results.errors.push(`${asin}: ${result.error.message}`);
    } else {
      results.validCount++;
    }
  }

  return results;
}; 