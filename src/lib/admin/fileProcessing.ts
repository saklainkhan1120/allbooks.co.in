import * as XLSX from "xlsx";
import { ParsedBook } from "./types";

// Download templates (both CSV and Excel)
export const downloadTemplate = (format: 'csv' | 'excel' = 'excel') => {
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

  const sampleData = [
    '9781234567890', // ISBN-13
    '1234567890',    // ISBN-10
    'ASIN123',       // ASIN
    'Sample Book Title', // Title
    'John Doe',      // Author
    'Jane Smith',    // Author_2
    'Alex Roe',      // Author_3
    '500',           // M.R.P. (Rs)
    '400',           // Selling Price (Rs)
    'https://example.com/cover.jpg', // Cover Image URL
    'Fiction',       // Subject Category
    'Adventure',     // Subject Category_2
    'Fiction',       // Genre
    'Thriller',      // Genre_2
    'Mystery',       // Genre_3
    'Hardcover',     // Format/Binding
    '300',           // Pages
    'English',       // Language
    'Sample Publisher', // Publisher
    '28 July 2025',  // Publishing Date
    'First Edition', // Edition
    '1 lb',          // Weight
    '6x9 inches',    // Dimensions
    'A sample book description.', // About the Book
    'About the author', // About the Author
    'Sample excerpt',   // Sample Text
    'fiction,adventure', // Tags
    'bestseller, new',   // Keywords
    'Bullet point 1',    // Bullet Text
    'Bullet point 2',    // Bullet Text_2
    'Bullet point 3',    // Bullet Text_3
    'Bullet point 4',    // Bullet Text_4
    'Bullet point 5',    // Bullet Text_5
    'active'             // Status
  ];

  if (format === 'excel') {
    // Create Excel file
    const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Books');
    // Auto-adjust column widths
    const colWidths = headers.map(() => ({ wch: 20 }));
    worksheet['!cols'] = colWidths;
    XLSX.writeFile(workbook, 'book_upload_template.xlsx');
  } else {
    // Create CSV file
    const csvContent = headers.join(',') + '\n' + 
      sampleData.map(field => 
        field.includes(',') || field.includes('"') ? `"${field.replace(/"/g, '""')}"` : field
      ).join(',');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'book_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
};

// Handle Excel file processing
export const handleExcelFile = async (file: File) => {
  return new Promise<{
    sheetNames: string[];
    processSheet: (sheetName: string) => Promise<{
      transformedData: ParsedBook[];
      validRows: ParsedBook[];
      invalidRows: ParsedBook[];
      preview: any[];
    }>;
  }>((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetNames = workbook.SheetNames;
        
        const processSheet = async (sheetName: string) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          return await processExcelData(jsonData, sheetName);
        };
        
        resolve({
          sheetNames,
          processSheet
        });
      } catch (error) {
        reject(new Error("Failed to read Excel file. Please check the file format."));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Process Excel data with validation
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
    const processedRow: any = {};
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
  
  // Check database uniqueness
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

// Transform CSV row to book data
export const transformRowToBook = (row: any, rowNumber: number, seen: {asin: Set<string>, isbn: Set<string>, isbn_10: Set<string>}) => {
  const errors: string[] = [];
  const get = (key: string) => (row[key.toLowerCase()] || '').toString().trim();

  // MANDATORY FIELDS
  const title = get('title');
  const author = get('author');
  const genre = get('genre');
  const isbn13 = get('isbn-13');
  const asin = get('asin');
  const isbn10 = get('isbn-10');

  // VALIDATION: Mandatory fields
  if (!title) errors.push('Missing required field: Title is required');
  if (!author) errors.push('Missing required field: Author is required');
  if (!genre) errors.push('Missing required field: Genre is required');
  if (!isbn13 && !asin) errors.push('Missing required field: At least one of ISBN-13 or ASIN is required');

  if (errors.length > 0) {
    return { data: null, originalData: row, errors, rowNumber };
  }

  // ISBN-10 generation logic
  let finalIsbn10 = isbn10;
  let finalAsin = asin;

  // Step 1: Generate ISBN-10 from ISBN-13 if available
  if (!finalIsbn10 && isbn13) {
    // Simple ISBN-13 to ISBN-10 conversion (simplified)
    if (isbn13.length === 13) {
      finalIsbn10 = isbn13.substring(3, 12);
    }
  }

  // Step 2: Use ISBN-10 as ASIN if ASIN is blank
  if (!finalAsin && finalIsbn10) {
    finalAsin = finalIsbn10;
  }

  // Step 3: If ISBN-13 is missing but ASIN is present, use ASIN as ISBN-10
  if (!finalIsbn10 && finalAsin) {
    finalIsbn10 = finalAsin;
  }

  // VALIDATION: Final ASIN check
  if (!finalAsin) {
    errors.push('Missing required field: ASIN is required and could not be generated from ISBN-10 or ISBN-13');
    return { data: null, originalData: row, errors, rowNumber };
  }

  if (finalAsin.length !== 10) {
    errors.push('ASIN must be exactly 10 characters');
    return { data: null, originalData: row, errors, rowNumber };
  }

  // DUPLICATE CHECK: Within file
  if (seen.asin.has(finalAsin)) {
    errors.push('Duplicate ASIN in file');
    return { data: null, originalData: row, errors, rowNumber };
  }
  seen.asin.add(finalAsin);

  if (isbn13 && seen.isbn.has(isbn13)) {
    errors.push('Duplicate ISBN-13 in file');
    return { data: null, originalData: row, errors, rowNumber };
  }
  if (isbn13) seen.isbn.add(isbn13);

  if (finalIsbn10 && seen.isbn_10.has(finalIsbn10)) {
    errors.push('Duplicate ISBN-10 in file');
    return { data: null, originalData: row, errors, rowNumber };
  }
  if (finalIsbn10) seen.isbn_10.add(finalIsbn10);

  // Parse publishing date
  let pubDate = null;
  const pubDateRaw = get('publishing date');
  if (pubDateRaw && pubDateRaw.trim() !== '') {
    const monthNames = [
      'january','february','march','april','may','june','july','august','september','october','november','december'
    ];
    const dateMatch = pubDateRaw.match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/);
    if (dateMatch) {
      const day = dateMatch[1].padStart(2, '0');
      const month = (monthNames.indexOf(dateMatch[2].toLowerCase()) + 1).toString().padStart(2, '0');
      const year = dateMatch[3];
      pubDate = `${year}-${month}-${day}`;
    } else {
      // Try to parse as YYYY-MM-DD format
      const date = new Date(pubDateRaw);
      if (!isNaN(date.getTime())) {
        pubDate = pubDateRaw;
      }
    }
  }

  // BUILD BOOK DATA
  const bookData = {
    isbn: isbn13,
    isbn_10: finalIsbn10,
    asin: finalAsin,
    title: title,
    author: author,
    second_author_narrator: get('author_2'),
    author_3: get('author_3'),
    inr_price: get('m.r.p. (rs)') ? parseFloat(get('m.r.p. (rs)')) : null,
    selling_price_inr: get('selling price (rs)') ? parseFloat(get('selling price (rs)')) : null,
    cover_image_url: get('cover image url'),
    subject_category_1: get('subject category'),
    subject_category_2: get('subject category_2'),
    main_genre: genre,
    genre_2: get('genre_2'),
    genre_3: get('genre_3'),
    book_format: get('format/binding'),
    page_count: get('pages') ? parseInt(get('pages')) : null,
    language: get('language'),
    publisher: get('publisher') || 'Unknown Publisher',
    publication_date: pubDate,
    edition: get('edition'),
    weight: get('weight'),
    dimensions: get('dimensions'),
    description: get('about the book'),
    about_the_author: get('about the author'),
    book_excerpts: get('sample text'),
    related_tags_keywords: get('tags') ? get('tags').split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    meta_keywords: get('keywords') ? get('keywords').split(',').map((k: string) => k.trim()).filter(Boolean) : [],
    bullet_text_1: get('bullet text'),
    bullet_text_2: get('bullet text_2'),
    bullet_text_3: get('bullet text_3'),
    bullet_text_4: get('bullet text_4'),
    bullet_text_5: get('bullet text_5'),
    status: (get('status') || 'active').toLowerCase(),
  };

  return { data: bookData, originalData: row, errors, rowNumber };
};

// Check uniqueness in database
export const checkUniqueInDB = async (rows: ParsedBook[]) => {
  const errors: { [rowNumber: number]: string[] } = {};
  
  try {
    // Get all ASINs, ISBNs, and ISBN-10s from the rows
    const asins = rows.map(row => row.data?.asin).filter(Boolean);
    const isbns = rows.map(row => row.data?.isbn).filter(Boolean);
    const isbn10s = rows.map(row => row.data?.isbn_10).filter(Boolean);
    
    // Check for duplicates in database using API call
    const response = await fetch('/api/admin/check-duplicates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ asins, isbns, isbn10s }),
    });

    if (!response.ok) {
      throw new Error('Failed to check database duplicates');
    }

    const result = await response.json();
    const duplicates = result.duplicates || {};
    
    // Add errors for duplicate entries
    rows.forEach(row => {
      if (!row.data) return;
      
      const rowErrors: string[] = [];
      
      if (row.data.asin && duplicates.asin?.includes(row.data.asin)) {
        rowErrors.push(`ASIN ${row.data.asin} already exists in database`);
      }
      
      if (row.data.isbn && duplicates.isbn?.includes(row.data.isbn)) {
        rowErrors.push(`ISBN-13 ${row.data.isbn} already exists in database`);
      }
      
      if (row.data.isbn_10 && duplicates.isbn_10?.includes(row.data.isbn_10)) {
        rowErrors.push(`ISBN-10 ${row.data.isbn_10} already exists in database`);
      }
      
      if (rowErrors.length > 0) {
        errors[row.rowNumber] = rowErrors;
      }
    });
    
  } catch (error) {
    console.error('Error checking database uniqueness:', error);
    // If we can't check database, don't block the upload
    // The database will handle duplicates during insertion
  }
  
  return errors;
};

// Export failed books to Excel
export const exportFailedBooksToExcel = (failedBooks: any[], originalHeaders: string[], fileName: string) => {
  // Create headers with error column
  const headers = [...originalHeaders, 'Errors'];
  
  // Create data rows with errors
  const dataRows = failedBooks.map(book => {
    const row = originalHeaders.map(header => {
      const key = header.toLowerCase();
      return book.originalData[key] || '';
    });
    // Add error messages as last column
    row.push(book.errors.join('; '));
    return row;
  });
  
  // Create Excel file
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Failed Books');
  
  // Auto-adjust column widths
  const colWidths = headers.map(() => ({ wch: 20 }));
  worksheet['!cols'] = colWidths;
  
  // Download file
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  XLSX.writeFile(workbook, `failed_books_${timestamp}.xlsx`);
}; 