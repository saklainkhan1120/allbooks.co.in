'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Book } from '@/types/book';
import BookForm from '@/components/BookForm';
import { useToast } from '@/hooks/use-toast';

const BookEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        router.push('/admin');
        return;
      }

      try {
        const response = await fetch(`/api/books/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch book');
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load book data');
        }

        setBook(result.data);
      } catch (error) {
        console.error('Error fetching book:', error);
        toast({
          title: "Error",
          description: "Failed to load book data.",
          variant: "destructive",
        });
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id, router, toast]);

  const handleSave = () => {
    toast({
      title: "Success",
      description: "Book updated successfully!",
    });
    router.push('/admin');
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading book data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BookForm 
        book={book} 
        onSave={handleSave} 
        onCancel={handleCancel} 
      />
    </div>
  );
};

export default BookEditPage; 