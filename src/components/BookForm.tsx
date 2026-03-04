'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Book } from '@/types/book';
import { isValidISBN10, isValidISBN13, isValidASIN, isbn13to10 } from '@/lib/utils';

interface FormField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  options?: { label: string; value: string }[];
}

interface FormSection {
  title: string;
  fields: FormField[];
}

interface BookFormProps {
  book?: Book | null;
  onSave?: () => void;
  onCancel?: () => void;
}

const BookForm: React.FC<BookFormProps> = ({ book, onSave, onCancel }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    isbn: '',
    isbn_10: '',
    asin: '',
    title: '',
    author: '',
    author_2: '',
    author_3: '',
    mrp_inr: '',
    selling_price_inr: '',
    cover_image_url: '',
    subject_category: '',
    subject_category_2: '',
    genre: '',
    genre_2: '',
    genre_3: '',
    format_binding: '',
    pages: '',
    language: '',
    publisher: '',
    publishing_date: '',
    edition: '',
    weight: '',
    dimensions: '',
    about_the_book: '',
    about_the_author: '',
    sample_text: '',
    tags: '',
    keywords: '',
    bullet_text: '',
    bullet_text_2: '',
    bullet_text_3: '',
    bullet_text_4: '',
    bullet_text_5: '',
    status: 'active',
  });

  useEffect(() => {
    if (book) {
      setFormData({
        isbn: book.isbn || '',
        isbn_10: book.isbn_10 || '',
        asin: book.asin || '',
        title: book.title || '',
        author: book.author || '',
        author_2: book.second_author_narrator || '',
        author_3: book.author_3 || '',
        mrp_inr: book.inr_price?.toString() || '',
        selling_price_inr: book.selling_price_inr?.toString() || '',
        cover_image_url: book.cover_image_url || '',
        subject_category: book.subject_category_1 || '',
        subject_category_2: book.subject_category_2 || '',
        genre: book.main_genre || '',
        genre_2: book.genre_2 || '',
        genre_3: book.genre_3 || '',
        format_binding: book.book_format || '',
        pages: book.page_count?.toString() || '',
        language: book.language || '',
        publisher: book.publisher || 'Unknown Publisher',
        publishing_date: book.publication_date || '',
        edition: book.edition || '',
        weight: book.weight || '',
        dimensions: book.dimensions || '',
        about_the_book: book.description || '',
        about_the_author: book.about_the_author || '',
        sample_text: book.book_excerpts || '',
        tags: book.related_tags_keywords?.join(', ') || '',
        keywords: book.meta_keywords?.join(', ') || '',
        bullet_text: book.bullet_text_1 || '',
        bullet_text_2: book.bullet_text_2 || '',
        bullet_text_3: book.bullet_text_3 || '',
        bullet_text_4: book.bullet_text_4 || '',
        bullet_text_5: book.bullet_text_5 || '',
        status: book.status || 'active',
      });
    }
  }, [book]);

  useEffect(() => {
    // Auto-populate ISBN-10
    let isbn10 = formData.isbn_10;
    if (formData.asin) {
      isbn10 = formData.asin;
    } else if (formData.isbn) {
      isbn10 = isbn13to10(formData.isbn) || '';
    }
    if (isbn10 !== formData.isbn_10) {
      setFormData(prev => ({ ...prev, isbn_10: isbn10 }));
    }
  }, [formData.asin, formData.isbn]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validation: At least one of ASIN, ISBN-13, ISBN-10
      if (!formData.isbn && !formData.asin) {
        toast({ title: 'Validation Error', description: 'At least one of ISBN-13 or ASIN is required', variant: 'destructive' });
        setIsLoading(false); return;
      }
      // Title required
      if (!formData.title) {
        toast({ title: 'Validation Error', description: 'Title is required', variant: 'destructive' });
        setIsLoading(false); return;
      }
      // Author required
      if (!formData.author) {
        toast({ title: 'Validation Error', description: 'Author is required', variant: 'destructive' });
        setIsLoading(false); return;
      }
      // Genre required
      if (!formData.genre) {
        toast({ title: 'Validation Error', description: 'Genre is required', variant: 'destructive' });
        setIsLoading(false); return;
      }
      // Only validate ISBN-10 if it wasn't auto-populated from ASIN
      if (formData.isbn_10 && formData.isbn_10 !== formData.asin && !isValidISBN10(formData.isbn_10)) {
        toast({ title: 'Validation Error', description: 'ISBN-10 must be exactly 10 alphanumeric characters', variant: 'destructive' });
        setIsLoading(false); return;
      }
      if (formData.isbn && !isValidISBN13(formData.isbn)) {
        toast({ title: 'Validation Error', description: 'ISBN-13 must be exactly 13 digits', variant: 'destructive' });
        setIsLoading(false); return;
      }
      if (formData.asin && !isValidASIN(formData.asin)) {
        toast({ title: 'Validation Error', description: 'ASIN must be exactly 10 alphanumeric characters', variant: 'destructive' });
        setIsLoading(false); return;
      }

      // Uniqueness check in DB
      const response = await fetch('/api/books/check-duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asin: formData.asin,
          isbn: formData.isbn,
          isbn_10: formData.isbn_10,
          excludeId: book?.id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to check duplicates');
      }
      
      const duplicateData = await response.json();
      if (duplicateData.hasDuplicates) {
        toast({ title: 'Validation Error', description: 'Your ASIN, ISBN-13, or ISBN-10 already exists in the database.', variant: 'destructive' });
        setIsLoading(false); 
        return;
      }

      // Parse publishing date
      let pubDate = null;
      if (formData.publishing_date && formData.publishing_date.trim() !== '') {
        const monthNames = [
          'january','february','march','april','may','june','july','august','september','october','november','december'
        ];
        const dateMatch = formData.publishing_date.match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/);
        if (dateMatch) {
          const day = dateMatch[1].padStart(2, '0');
          const month = (monthNames.indexOf(dateMatch[2].toLowerCase()) + 1).toString().padStart(2, '0');
          const year = dateMatch[3];
          pubDate = `${year}-${month}-${day}`;
        } else {
          // Try to parse as YYYY-MM-DD format
          const date = new Date(formData.publishing_date);
          if (!isNaN(date.getTime())) {
            pubDate = formData.publishing_date;
          }
        }
      }

      const bookData = {
        isbn: formData.isbn,
        isbn_10: formData.isbn_10,
        asin: formData.asin,
        title: formData.title,
        author: formData.author,
        second_author_narrator: formData.author_2,
        author_3: formData.author_3,
        inr_price: formData.mrp_inr ? parseFloat(formData.mrp_inr) : null,
        selling_price_inr: formData.selling_price_inr ? parseFloat(formData.selling_price_inr) : null,
        cover_image_url: formData.cover_image_url,
        subject_category_1: formData.subject_category,
        subject_category_2: formData.subject_category_2,
        main_genre: formData.genre,
        genre_2: formData.genre_2,
        genre_3: formData.genre_3,
        book_format: formData.format_binding,
        page_count: formData.pages ? parseInt(formData.pages) : null,
        language: formData.language,
        publisher: formData.publisher || 'Unknown Publisher',
        publication_date: pubDate,
        edition: formData.edition,
        weight: formData.weight,
        dimensions: formData.dimensions,
        description: formData.about_the_book,
        about_the_author: formData.about_the_author,
        book_excerpts: formData.sample_text,
        related_tags_keywords: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        meta_keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
        bullet_text_1: formData.bullet_text,
        bullet_text_2: formData.bullet_text_2,
        bullet_text_3: formData.bullet_text_3,
        bullet_text_4: formData.bullet_text_4,
        bullet_text_5: formData.bullet_text_5,
        status: (formData.status || 'active').toLowerCase(),
      };

      // Save book using our database interface
      const saveResponse = await fetch('/api/books', {
        method: book?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookData,
          id: book?.id
        }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save book');
      }

      toast({ title: 'Success', description: book?.id ? 'Book updated successfully!' : 'Book created successfully!' });
      
      onSave?.();
    } catch (error) {
      console.error('Error saving book:', error);
      toast({ title: 'Error', description: 'Failed to save book. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const formSections: FormSection[] = [
    { title: 'Basic Information', fields: [
      { key: 'title', label: 'Title*', type: 'input', required: true },
      { key: 'author', label: 'Author*', type: 'input', required: true },
      { key: 'author_2', label: 'Author 2', type: 'input' },
      { key: 'author_3', label: 'Author 3', type: 'input' },
      { key: 'asin', label: 'ASIN', type: 'input' },
      { key: 'isbn', label: 'ISBN-13', type: 'input' },
      { key: 'isbn_10', label: 'ISBN-10', type: 'input' },
      { key: 'cover_image_url', label: 'Cover Image URL', type: 'input' },
      { key: 'publisher', label: 'Publisher', type: 'input' },
      { key: 'language', label: 'Language', type: 'input' },
      { key: 'publishing_date', label: 'Publishing Date', type: 'input', placeholder: 'DD MMMM YYYY (e.g., 28 July 2025)' },
      { key: 'pages', label: 'Pages', type: 'number' },
    ]},
    { title: 'Categories & Genres', fields: [
      { key: 'subject_category', label: 'Subject Category', type: 'input' },
      { key: 'subject_category_2', label: 'Subject Category 2', type: 'input' },
      { key: 'genre', label: 'Genre*', type: 'input', required: true },
      { key: 'genre_2', label: 'Genre 2', type: 'input' },
      { key: 'genre_3', label: 'Genre 3', type: 'input' },
    ]},
    { title: 'Pricing', fields: [
      { key: 'mrp_inr', label: 'M.R.P. (Rs)', type: 'number', step: '0.01' },
      { key: 'selling_price_inr', label: 'Selling Price (Rs)', type: 'number', step: '0.01' },
    ]},
    { title: 'Book Details', fields: [
      { key: 'format_binding', label: 'Format/Binding', type: 'input' },
      { key: 'edition', label: 'Edition', type: 'input' },
      { key: 'weight', label: 'Weight', type: 'input' },
      { key: 'dimensions', label: 'Dimensions', type: 'input' },
      { key: 'about_the_book', label: 'About the Book', type: 'textarea' },
      { key: 'about_the_author', label: 'About the Author', type: 'textarea' },
      { key: 'sample_text', label: 'Sample Text', type: 'textarea' },
    ]},
    { title: 'Tags, Keywords, Bullets', fields: [
      { key: 'tags', label: 'Tags (comma-separated)', type: 'input' },
      { key: 'keywords', label: 'Keywords (comma-separated)', type: 'input' },
      { key: 'bullet_text', label: 'Bullet Text 1', type: 'input' },
      { key: 'bullet_text_2', label: 'Bullet Text 2', type: 'input' },
      { key: 'bullet_text_3', label: 'Bullet Text 3', type: 'input' },
      { key: 'bullet_text_4', label: 'Bullet Text 4', type: 'input' },
      { key: 'bullet_text_5', label: 'Bullet Text 5', type: 'input' },
    ]},
    { title: 'Status', fields: [
      { key: 'status', label: 'Status', type: 'select', options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ] },
    ]},
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">{book?.id ? 'Edit Book' : 'Add New Book'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {formSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 text-gray-900">{section.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.fields.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <Label htmlFor={field.key} className="text-gray-700">{field.label}</Label>
                      {field.type === 'select' ? (
                        <select
                          id={field.key}
                          value={formData[field.key as keyof typeof formData]}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          required={field.required}
                          className="block w-full border border-gray-300 rounded px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <Textarea
                          id={field.key}
                          value={formData[field.key as keyof typeof formData]}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          required={field.required}
                          rows={3}
                          className="border border-gray-300 text-gray-900 bg-white"
                        />
                      ) : field.key === 'isbn_10' ? (
                        <Input
                          id={field.key}
                          type="text"
                          value={formData[field.key as keyof typeof formData]}
                          readOnly
                          className="bg-gray-100 cursor-not-allowed border border-gray-300 text-gray-900"
                        />
                      ) : (
                        <Input
                          id={field.key}
                          type={field.type || 'text'}
                          step={field.step}
                          placeholder={field.placeholder}
                          value={formData[field.key as keyof typeof formData]}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          required={field.required}
                          className="border border-gray-300 text-gray-900 bg-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-4 pt-6">
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isLoading ? 'Saving...' : (book?.id ? 'Update Book' : 'Create Book')}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookForm; 