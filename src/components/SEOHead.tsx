import React from 'react';
import { Metadata } from 'next';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'book';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  isbn?: string;
  asin?: string;
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock';
  rating?: number;
  reviewCount?: number;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'Bookverse Nexus - Book Discovery Platform',
  description = 'Discover millions of books across all genres at Bookverse Nexus. Find your next favorite read with detailed reviews, author information, and the best prices.',
  keywords = ['books', 'book catalog', 'reading', 'literature', 'authors', 'publishers', 'book discovery', 'bookverse', 'online bookstore', 'book search'],
  image = '/placeholder.svg',
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  isbn,
  asin,
  price,
  currency = 'INR',
  availability,
  rating,
  reviewCount,
}) => {
  // This component is for client-side SEO updates
  // For server-side, use Next.js metadata in page components
  return null;
};

// Helper function to generate metadata for Next.js pages
export function generateMetadata(props: SEOHeadProps): Metadata {
  const {
    title = 'Bookverse Nexus - Book Discovery Platform',
    description = 'Discover millions of books across all genres at Bookverse Nexus. Find your next favorite read with detailed reviews, author information, and the best prices.',
    keywords = ['books', 'book catalog', 'reading', 'literature', 'authors', 'publishers', 'book discovery', 'bookverse', 'online bookstore', 'book search'],
    image = '/placeholder.svg',
    url,
    type = 'website',
    author,
    isbn,
    asin,
    price,
    currency = 'INR',
    availability,
    rating,
    reviewCount,
  } = props;

  const metadata: Metadata = {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [image],
      type,
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };

  // Add structured data for books
  if (type === 'book' && (isbn || asin)) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: title,
      description,
      image,
      author: author ? { '@type': 'Person', name: author } : undefined,
      isbn,
      asin,
      ...(price && {
        offers: {
          '@type': 'Offer',
          price,
          priceCurrency: currency,
          availability: availability ? `https://schema.org/${availability.replace(' ', '')}` : undefined,
        },
      }),
      ...(rating && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: rating,
          reviewCount,
        },
      }),
    };

    // Add the structured data to the page
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }

  return metadata;
} 