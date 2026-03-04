import * as XLSX from 'xlsx';

export interface ExportFilters {
  status?: string;
  genre?: string;
  author?: string;
  publisher?: string;
  limit?: number;
}

// Export books with filters (client-side utility)
// Calls a server API so that Prisma runs ONLY on the server
export const exportBooks = async (filters: ExportFilters, format: 'csv' | 'excel' = 'excel') => {
  console.log('Export function called with filters:', filters);
  // Call server API
  const response = await fetch('/api/admin/export-books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters)
  });
  const result = await response.json();
  if (!result?.success) {
    throw new Error(result?.error || 'Failed to fetch books for export');
  }
  const data = result.data || [];
  if (!data.length) throw new Error('No books found matching the filters');

  if (format === 'excel') {
    // Use the same format as bulk upload template
    const exportData = data.map((book: any) => ({
      'ISBN-13': book.isbn || '',
      'ISBN-10': book.isbn_10 || '',
      'ASIN': book.asin || '',
      'Title': (book.title || '').substring(0, 32000),
      'Author': (book.author || '').substring(0, 32000),
      'Author_2': book.second_author_narrator || '',
      'Author_3': book.author_3 || '',
      'M.R.P. (Rs)': book.inr_price || '',
      'Selling Price (Rs)': book.selling_price_inr || '',
      'Cover Image URL': book.cover_image_url || '',
      'Subject Category': book.subject_category_1 || '',
      'Subject Category_2': book.subject_category_2 || '',
      'Genre': book.main_genre || '',
      'Genre_2': book.genre_2 || '',
      'Genre_3': book.genre_3 || '',
      'Format/Binding': book.book_format || '',
      'Pages': book.page_count || '',
      'Language': book.language || '',
      'Publisher': (book.publisher || '').substring(0, 32000),
      'Publishing Date': book.publication_date || '',
      'Edition': book.edition || '',
      'Weight': book.weight || '',
      'Dimensions': book.dimensions || '',
      'About the Book': (book.description || '').substring(0, 32000),
      'About the Author': (book.about_the_author || '').substring(0, 32000),
      'Sample Text': (book.book_excerpts || '').substring(0, 32000),
      'Tags': Array.isArray(book.related_tags_keywords) ? book.related_tags_keywords.join(',') : (book.related_tags_keywords || ''),
      'Keywords': Array.isArray(book.meta_keywords) ? book.meta_keywords.join(',') : (book.meta_keywords || ''),
      'Bullet Text': book.bullet_text_1 || '',
      'Bullet Text_2': book.bullet_text_2 || '',
      'Bullet Text_3': book.bullet_text_3 || '',
      'Bullet Text_4': book.bullet_text_4 || '',
      'Bullet Text_5': book.bullet_text_5 || '',
      'Status': book.status || 'active'
    }));
    
    // Create Excel file like backup app
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Books');
    
    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `books_export_${timestamp}.xlsx`;
    
    XLSX.writeFile(wb, filename);
  } else {
    // CSV export - use the same format as bulk upload template
    const headers = [
      'ISBN-13',
      'ISBN-10', 
      'ASIN',
      'Title',
      'Author',
      'Author_2',
      'Author_3',
      'M.R.P. (Rs)',
      'Selling Price (Rs)',
      'Cover Image URL',
      'Subject Category',
      'Subject Category_2',
      'Genre',
      'Genre_2',
      'Genre_3',
      'Format/Binding',
      'Pages',
      'Language',
      'Publisher',
      'Publishing Date',
      'Edition',
      'Weight',
      'Dimensions',
      'About the Book',
      'About the Author',
      'Sample Text',
      'Tags',
      'Keywords',
      'Bullet Text',
      'Bullet Text_2',
      'Bullet Text_3',
      'Bullet Text_4',
      'Bullet Text_5',
      'Status'
    ];

    const rows = data.map((book: any) => [
      book.isbn || '',
      book.isbn_10 || '',
      book.asin || '',
      (book.title || '').substring(0, 32000),
      (book.author || '').substring(0, 32000),
      book.second_author_narrator || '',
      book.author_3 || '',
      book.inr_price || '',
      book.selling_price_inr || '',
      book.cover_image_url || '',
      book.subject_category_1 || '',
      book.subject_category_2 || '',
      book.main_genre || '',
      book.genre_2 || '',
      book.genre_3 || '',
      book.book_format || '',
      book.page_count || '',
      book.language || '',
      (book.publisher || '').substring(0, 32000),
      book.publication_date || '',
      book.edition || '',
      book.weight || '',
      book.dimensions || '',
      (book.description || '').substring(0, 32000),
      (book.about_the_author || '').substring(0, 32000),
      (book.book_excerpts || '').substring(0, 32000),
      Array.isArray(book.related_tags_keywords) ? book.related_tags_keywords.join(',') : (book.related_tags_keywords || ''),
      Array.isArray(book.meta_keywords) ? book.meta_keywords.join(',') : (book.meta_keywords || ''),
      book.bullet_text_1 || '',
      book.bullet_text_2 || '',
      book.bullet_text_3 || '',
      book.bullet_text_4 || '',
      book.bullet_text_5 || '',
      book.status || 'active'
    ].map((value: any) => {
      // Truncate long text to prevent Excel errors
      const stringValue = String(value ?? '');
      const truncatedValue = stringValue.length > 32000 ? stringValue.substring(0, 32000) + '...' : stringValue;
      return truncatedValue.includes(',') || truncatedValue.includes('"')
        ? `"${truncatedValue.replace(/"/g, '""')}"`
        : truncatedValue;
    }).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `books_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  return data.length;
}; 