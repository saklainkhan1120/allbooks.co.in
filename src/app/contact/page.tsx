import { Metadata } from 'next';
import { ContactPage } from '@/components/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Us - allBooks.co.in',
  description: 'Get in touch with allBooks.co.in. We\'re here to help you find your next great read and answer any questions you may have.',
  keywords: ['contact us', 'customer service', 'support', 'books', 'allbooks', 'help'],
  openGraph: {
    title: 'Contact Us - allBooks.co.in',
    description: 'Get in touch with allBooks.co.in. We\'re here to help you find your next great read.',
    type: 'website',
  },
};

export default function Contact() {
  return <ContactPage />;
} 