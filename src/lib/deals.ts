export interface DailyDealBook {
  id?: string;
  asin: string;
  title: string;
  author?: string;
  cover_image_url?: string;
  inr_price?: number;
  position?: number;
  is_fixed_position?: boolean;
  is_top_six?: boolean;
  created_at?: string;
}

export interface DealsStats {
  totalDeals: number;
  fixedPositionDeals: number;
  topSixDeals: number;
}

// Get deals statistics
export const getDealsStats = async (): Promise<DealsStats> => {
  try {
    const response = await fetch('/api/deals/stats');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch deals stats');
    }

    return {
      totalDeals: data.stats?.totalDeals || 0,
      fixedPositionDeals: data.stats?.fixedPositionDeals || 0,
      topSixDeals: data.stats?.topSixDeals || 0
    };
  } catch (error) {
    console.error('Error getting deals stats:', error);
    throw error;
  }
};

// Remove deal
export const removeDeal = async (dealId: string) => {
  try {
    const response = await fetch(`/api/deals/${dealId}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    return { error: result.error };
  } catch (error) {
    console.error('Error removing deal:', error);
    return { error };
  }
};

// Set as top six
export const setAsTopSix = async (dealId: string) => {
  try {
    const response = await fetch(`/api/deals/${dealId}/top-six`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_top_six: true })
    });
    const result = await response.json();
    return { error: result.error };
  } catch (error) {
    console.error('Error setting as top six:', error);
    return { error };
  }
};

// Remove from top six
export const removeFromTopSix = async (dealId: string) => {
  try {
    const response = await fetch(`/api/deals/${dealId}/top-six`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_top_six: false })
    });
    const result = await response.json();
    return { error: result.error };
  } catch (error) {
    console.error('Error removing from top six:', error);
    return { error };
  }
};

// Set as fixed position
export const setAsFixedPosition = async (dealId: string) => {
  try {
    const response = await fetch(`/api/deals/${dealId}/fixed-position`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_fixed_position: true })
    });
    const result = await response.json();
    return { error: result.error };
  } catch (error) {
    console.error('Error setting as fixed position:', error);
    return { error };
  }
};

// Remove from fixed position
export const removeFromFixedPosition = async (dealId: string) => {
  try {
    const response = await fetch(`/api/deals/${dealId}/fixed-position`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_fixed_position: false })
    });
    const result = await response.json();
    return { error: result.error };
  } catch (error) {
    console.error('Error removing from fixed position:', error);
    return { error };
  }
};

// Add daily deal
export const addDailyDeal = async (dealData: {
  asin: string;
  position: number;
  is_top_six?: boolean;
  is_fixed_position?: boolean;
}) => {
  try {
    const response = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealData)
    });
    const result = await response.json();
    return { error: result.error };
  } catch (error) {
    console.error('Error adding daily deal:', error);
    return { error };
  }
};

// Search books for deals
export const searchBooksForDeals = async (searchTerm: string) => {
  try {
    const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchTerm)}&page=1&limit=20`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to search books');
    }

    return {
      data: result.data?.map((book: any) => ({
        asin: book.asin,
        title: book.title,
        author: book.author,
        cover_image_url: book.cover_image_url,
        inr_price: book.inr_price
      })) || [],
      error: null
    };
  } catch (error) {
    console.error('Error searching books for deals:', error);
    return { data: null, error };
  }
};

// Bulk upload ASINs to deals
export const bulkUploadAsinsToDeals = async (asins: string[]) => {
  try {
    const response = await fetch('/api/deals/bulk-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asins })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to bulk upload ASINs');
    }

    return result.data; // Return the data directly like backup app
  } catch (error) {
    console.error('Error bulk uploading ASINs to deals:', error);
    return {
      totalCount: asins.length,
      validCount: 0,
      error: new Error('Bulk upload failed')
    };
  }
};
