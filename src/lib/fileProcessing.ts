import * as XLSX from 'xlsx';
import { CSVData, ParsedBook } from './admin/types';
import { transformRowToBook, checkUniqueInDB } from './admin/fileProcessing';

// Handle Excel file processing with enhanced validation
export const processExcelData = async (data: any[], sheetName: string) => {
  if (!data || data.length === 0) {
    throw new Error(`The selected sheet "${sheetName}" is empty`);
  }

  // Add file size limit
  const MAX_BOOKS = 15000; // 15,000 books max
  if (data.length > MAX_BOOKS) {
    throw new Error(`File too large. Maximum ${MAX_BOOKS.toLocaleString()} books allowed. Your file has ${data.length.toLocaleString()} books.`);
  }

  // Validate Excel structure
  const requiredHeaders = ['title', 'author', 'genre'];
  const optionalHeaders = ['isbn-13', 'asin', 'isbn-10'];
  const allHeaders = Object.keys(data[0] || {}).map(h => h.toLowerCase());
  
  // Check if at least one identifier column exists
  const hasIdentifier = optionalHeaders.some(header => allHeaders.includes(header));
  if (!hasIdentifier) {
    throw new Error('Excel file must contain at least one of: ISBN-13, ASIN, or ISBN-10');
  }

  // Convert Excel data to consistent format
  const processedData = data.map((row) => {
    const processedRow: CSVData = {};
    Object.keys(row).forEach((key) => {
      const cleanKey = key.toString().trim().toLowerCase();
      const value = row[key];
      
      // Handle different data types from Excel
      if (value === null || value === undefined) {
        processedRow[cleanKey] = '';
      } else if (typeof value === 'number') {
        // Handle Excel dates (serial numbers)
        if (cleanKey.includes('date') && value > 25000 && value < 100000) {
          const excelDate = new Date((value - 25569) * 86400 * 1000);
          processedRow[cleanKey] = excelDate.toISOString().split('T')[0];
        } else {
          processedRow[cleanKey] = value.toString();
        }
      } else {
        processedRow[cleanKey] = value.toString().trim();
      }
    });
    return processedRow;
  });

  // Show preview and process
  const seen = { asin: new Set<string>(), isbn: new Set<string>(), isbn_10: new Set<string>() };
  let transformedData = processedData.map((row, index) => 
    transformRowToBook(row, index + 2, seen)
  );
  
  // Re-enable database uniqueness check for better performance and error reporting
  const dbErrors = await checkUniqueInDB(transformedData);
  transformedData = transformedData.map(row => {
    if (dbErrors[row.rowNumber]) {
      row.errors.push(...dbErrors[row.rowNumber]);
    }
    return row;
  });
  
  const validRows = transformedData.filter(row => row.errors.length === 0);
  const invalidRows = transformedData.filter(row => row.errors.length > 0);
  
  return {
    transformedData,
    validRows,
    invalidRows,
    preview: processedData.slice(0, 5)
  };
};

// Download template
export const downloadTemplate = (format: 'excel' | 'csv') => {
  const templateData = [
    {
      title: 'Sample Book Title',
      author: 'Sample Author',
      genre: 'Fiction',
      asin: 'B08N5WRWNW',
      isbn: '9781234567890',
      'isbn-10': '1234567890',
      publisher: 'Sample Publisher',
      description: 'Sample book description',
      'cover_image_url': 'https://example.com/cover.jpg',
      'publication_date': '2023-01-01',
      'page_count': '300',
      language: 'English',
      format: 'Paperback',
      'inr_price': '499.00',
      'usd_price': '9.99',
      rating: '4.5',
      'review_count': '100',
      'genre_2': 'Mystery',
      'genre_3': 'Thriller',
      'subject_category_1': 'Literature',
      'subject_category_2': 'Contemporary',
      'second_author_narrator': 'Co-Author',
      'author_3': 'Third Author',
      keywords: 'sample, book, keywords',
      highlights: 'Sample book highlights',
      status: 'active'
    }
  ];

  if (format === 'excel') {
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Books');
    XLSX.writeFile(wb, 'book_template.xlsx');
  } else {
    // CSV format
    const headers = Object.keys(templateData[0]);
    const csvContent = [
      headers.join(','),
      ...templateData.map(row => headers.map(header => `"${(row as any)[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'book_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
};

// Export failed books to Excel
export const exportFailedBooksToExcel = (failedBooks: ParsedBook[]) => {
  const failedData = failedBooks.map(book => ({
    ...book.originalData,
    errors: book.errors.join('; ')
  }));

  const ws = XLSX.utils.json_to_sheet(failedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Failed Books');
  XLSX.writeFile(wb, 'failed_books.xlsx');
}; 