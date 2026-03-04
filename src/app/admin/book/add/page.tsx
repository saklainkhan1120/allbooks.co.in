'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import BookForm from '@/components/BookForm';

const BookAddPage = () => {
  const router = useRouter();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Success",
      description: "Book created successfully!",
    });
    router.push('/admin');
  };

  const handleCancel = () => {
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BookForm 
        onSave={handleSave} 
        onCancel={handleCancel} 
      />
    </div>
  );
};

export default BookAddPage; 