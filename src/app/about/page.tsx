import { Metadata } from 'next';
import { AboutPage } from '@/components/AboutPage';

export const metadata: Metadata = {
  title: 'About Us - Your Ultimate Book Discovery Platform | allBooks.co.in',
  description: 'Discover allBooks.co.in - India\'s premier book discovery platform with 100,000+ books. Find bestsellers, new releases, academic books, and daily deals. Connect with authors and explore diverse categories.',
  keywords: [
    'about us', 'bookstore', 'books', 'reading', 'allbooks', 'mission', 
    'book discovery', 'online bookstore', 'bestsellers', 'new releases', 
    'academic books', 'daily deals', 'author discovery', 'book categories',
    'fiction books', 'non-fiction books', 'children books', 'textbooks',
    'book recommendations', 'literary platform', 'reading community'
  ],
  openGraph: {
    title: 'About Us - Your Ultimate Book Discovery Platform | allBooks.co.in',
    description: 'Discover allBooks.co.in - India\'s premier book discovery platform with 100,000+ books. Find bestsellers, new releases, academic books, and daily deals.',
    type: 'website',
    images: [
      {
        url: '/og-about.jpg',
        width: 1200,
        height: 630,
        alt: 'allBooks.co.in - Book Discovery Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - Your Ultimate Book Discovery Platform | allBooks.co.in',
    description: 'Discover allBooks.co.in - India\'s premier book discovery platform with 100,000+ books.',
  },
  alternates: {
    canonical: 'https://allbooks.co.in/about',
  },
};

export default function About() {
  return <AboutPage />;
} 