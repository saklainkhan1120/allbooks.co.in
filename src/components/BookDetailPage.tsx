'use client';

import { Book, getBookTitle, getBookGenre, getBookAuthor, getBookCover } from "@/types/book";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, BookOpen } from "lucide-react";
import { ReadMore } from "@/components/ReadMore";
import { BookPreview } from "@/components/BookPreview";
import { SimilarBooks } from "@/components/SimilarBooks";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import AffiliateButton from "@/components/ui/AffiliateButton";
import { DailyDeals } from "@/components/DailyDeals";
import { generateAffiliateLinks } from '@/lib/utils';
import Link from "next/link";

interface BookDetailPageProps {
  book: Book;
}

export const BookDetailPage = ({ book }: BookDetailPageProps) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Function to truncate title to 120 characters
  const truncateTitle = (title: string, maxLength: number = 120) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  const affiliateLinks = generateAffiliateLinks({
    title: getBookTitle(book),
    isbn10: book.isbn_10 || '',
    isbn13: book.isbn || '',
  });

  return (
    <div className="bg-white overflow-hidden">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Breadcrumbs */}
        <div className="mb-4 sm:mb-6">
          <Breadcrumbs 
            items={[
              { label: 'Home', path: '/' },
              { label: 'Books', path: '/search' },
              { label: getBookTitle(book), isCurrent: true }
            ]}
          />
        </div>

        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
          {/* Main book info section - Image and basic details */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8">
            {/* Book Cover - Responsive and sticky on desktop */}
            <div className="lg:w-96">
              <div className="sticky top-20 lg:top-32">
                <div className="w-full max-w-xs mx-auto lg:mx-0 lg:w-80">
                  <img
                    src={getBookCover(book)}
                    alt={getBookTitle(book)}
                    className="w-full shadow-lg rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                  {/* Free Preview Section */}
                  {book.book_excerpts && (
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Look Inside
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div className="flex-1 space-y-4">
              {/* Title and Author */}
              <div>
                <h1 
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-2"
                  title={getBookTitle(book)} // Show full title on hover
                >
                  {truncateTitle(getBookTitle(book))}
                </h1>
                {/* All authors below title */}
                {(book.author || book.second_author_narrator || book.author_3) && (
                  <p className="text-sm sm:text-base text-gray-700 mb-4 font-bold">
                    by {[
                      book.author && <Link key="author1" href={`/author/${encodeURIComponent(book.author)}`} className="text-blue-600 hover:underline">{book.author}</Link>,
                      book.second_author_narrator && <Link key="author2" href={`/author/${encodeURIComponent(book.second_author_narrator)}`} className="text-blue-600 hover:underline">{book.author ? ', ' : ''}{book.second_author_narrator}</Link>,
                      book.author_3 && <Link key="author3" href={`/author/${encodeURIComponent(book.author_3)}`} className="text-blue-600 hover:underline">{(book.author || book.second_author_narrator) ? ', ' : ''}{book.author_3}</Link>
                    ].filter(Boolean)}
                  </p>
                )}

                {/* Subject Categories and Genres */}
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-4">
                  {[
                    book.subject_category_1,
                    book.subject_category_2,
                    book.main_genre,
                    book.genre_2,
                    book.genre_3
                  ].filter(Boolean).map((item, index) => {
                    const isSubject = index < 2;
                    const linkTo = isSubject ? `/subject/${encodeURIComponent(item as string)}` : `/genre/${encodeURIComponent(item as string)}`;
                    return (
                      <Link key={`${item}-${index}`} href={linkTo}>
                        <span className="inline-block bg-teal-100 text-teal-800 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-full hover:bg-teal-200 transition-colors cursor-pointer">
                          {item}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Section Separator */}
              <div className="border-t border-black pt-6">
                {/* Price */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4">
                  {book.selling_price_inr && book.inr_price ? (
                    <>
                      <span className="text-xl sm:text-2xl font-bold text-gray-900">
                        ₹{book.selling_price_inr}
                      </span>
                      <span className="text-base sm:text-lg text-gray-500 line-through">
                        ₹{book.inr_price}
                      </span>
                      <span className="text-sm sm:text-base text-green-700 font-semibold">
                        ({Math.round(100 * (1 - book.selling_price_inr / book.inr_price))}% off)
                      </span>
                    </>
                  ) : book.selling_price_inr ? (
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      ₹{book.selling_price_inr}
                    </span>
                  ) : book.inr_price ? (
                    <span className="text-lg sm:text-xl text-gray-900">
                      ₹{book.inr_price}
                    </span>
                  ) : null}
                </div>
                
                {/* Purchase Options */}
                {(() => {
                  const affiliateStores = [
                    { name: 'Amazon.in', url: affiliateLinks.amazonIn },
                    { name: 'Flipkart.com', url: affiliateLinks.flipkart },
                    { name: 'Bookscape.com', url: affiliateLinks.bookscape },
                    { name: 'Bookswagon.com', url: affiliateLinks.bookswagon },
                    { name: 'Sapnaonline.com', url: affiliateLinks.sapnaonline },
                    { name: 'Jiomart.com', url: affiliateLinks.jiomart },
                    { name: 'Crossword.in', url: affiliateLinks.crossword },
                    { name: 'Amazon.com', url: affiliateLinks.amazonCom },
                  ].filter(store => store.url);

                  return affiliateStores.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg lg:text-xl font-semibold mb-3 text-orange-600">Purchase Options</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 lg:gap-3">
                        {affiliateStores.map((store) => (
                          <AffiliateButton
                            key={store.name}
                            store={store.name}
                            onClick={() => window.open(store.url, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Product Details Section */}
              <div className="border-t border-black pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Product Details</h3>
                
                {/* First Table - Responsive Grid */}
                <div className="mb-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                    <div className="space-y-3">
                      {book.language && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 font-poppins text-[15px] mb-1 sm:mb-0">Language:</span>
                          <span className="text-sm font-medium text-gray-900 font-poppins text-[15px]">{book.language.toUpperCase()}</span>
                        </div>
                      )}
                      {book.book_format && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 font-poppins text-[15px] mb-1 sm:mb-0">Format:</span>
                          <span className="text-sm font-medium text-gray-900 font-poppins text-[15px]">{book.book_format.toUpperCase()}</span>
                        </div>
                      )}
                      {book.page_count && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 font-poppins text-[15px] mb-1 sm:mb-0">Pages:</span>
                          <span className="text-sm font-medium text-gray-900 font-poppins text-[15px]">{book.page_count}</span>
                        </div>
                      )}
                      {book.isbn && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 font-poppins text-[15px] mb-1 sm:mb-0">ISBN 13:</span>
                          <span className="text-sm font-medium text-gray-900 font-mono font-poppins text-[15px] break-all">{book.isbn}</span>
                        </div>
                      )}
                      {book.isbn_10 && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 font-poppins text-[15px] mb-1 sm:mb-0">ISBN 10:</span>
                          <span className="text-sm font-medium text-gray-900 font-mono font-poppins text-[15px] break-all">{book.isbn_10}</span>
                        </div>
                      )}
                      {book.asin && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 font-poppins text-[15px] mb-1 sm:mb-0">SKU/ASIN:</span>
                          <span className="text-sm font-medium text-gray-900 font-mono font-poppins text-[15px] break-all">{book.asin}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {book.publisher && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 font-poppins text-[15px] mb-1 sm:mb-0">Publisher:</span>
                          <Link 
                            href={`/publisher/${encodeURIComponent(book.publisher)}`}
                            className="text-sm font-medium text-blue-600 hover:underline font-poppins text-[15px] break-all"
                          >
                            {book.publisher}
                          </Link>
                        </div>
                      )}
                      {book.publication_date && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 font-poppins text-[15px] mb-1 sm:mb-0">Pub. Date:</span>
                          <span className="text-sm font-medium text-gray-900 font-poppins text-[15px]">{formatDate(book.publication_date)}</span>
                        </div>
                      )}
                      {book.edition && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 font-poppins text-[15px] mb-1 sm:mb-0">Edition:</span>
                          <span className="text-sm font-medium text-gray-900 font-poppins text-[15px]">{book.edition}</span>
                        </div>
                      )}
                      {book.weight && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 font-poppins text-[15px] mb-1 sm:mb-0">Weight:</span>
                          <span className="text-sm font-medium text-gray-900 font-poppins text-[15px]">{book.weight}</span>
                        </div>
                      )}
                      {book.dimensions && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 font-poppins text-[15px] mb-1 sm:mb-0">Dimensions:</span>
                          <span className="text-sm font-medium text-gray-900 font-poppins text-[15px]">{book.dimensions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Table - Only if there are additional fields */}
              {(book.series_name || book.place_of_origin) && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                    <div className="space-y-3">
                      {book.series_name && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 mb-1 sm:mb-0">Series:</span>
                          <span className="text-sm font-medium text-gray-900">{book.series_name}</span>
                        </div>
                      )}
                      {book.place_of_origin && (
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="text-sm text-gray-600 w-20 sm:w-24 mb-1 sm:mb-0">Origin:</span>
                          <span className="text-sm font-medium text-gray-900">{book.place_of_origin}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {/* Additional fields can be added here */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags Section - Above About the Book */}
          {book.related_tags_keywords && book.related_tags_keywords.length > 0 && (
            <div className="pt-2">
              <div className="mb-4">
                {book.related_tags_keywords.map((tag, idx) => (
                  <Link key={idx} href={`/tag/${encodeURIComponent(tag)}`}>
                    <Badge className="mr-2 mb-1 bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors">{tag}</Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* About the Book Section */}
          <div className="border-t border-gray-400 pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 text-left">About the Book</h2>
            {book.description && (
              <div className="text-black font-poppins text-base font-normal leading-[26px] text-left">
                <ReadMore text={book.description} className="mb-2 whitespace-pre-line" maxLines={6} />
              </div>
            )}
          </div>

          {/* Similar Books Section - Between About the Book and About the Author */}
          <div className="border-t border-gray-400 pt-6">
            <SimilarBooks 
              currentBookId={book.id || ''}
              currentBookTitle={book.title || ''}
              currentBookAuthor={book.author || ''}
              currentBookGenre={book.main_genre || ''}
              currentBookASIN={book.asin || ''}
              maxBooks={18}
            />
          </div>

          {/* About the Author */}
          {book.about_the_author && (
            <div className="border-t border-gray-400 pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 text-left">About the Author</h2>
              <div className="text-black font-poppins text-base font-normal leading-[26px] text-left">
                <ReadMore text={book.about_the_author} className="mb-2 whitespace-pre-line" maxLines={6} />
              </div>
            </div>
          )}

          {/* Daily Deals Section - After About the Author */}
          <div className="border-t border-gray-400 pt-6">
            <DailyDeals bookASIN={book.asin || ''} />
          </div>

          {/* Free Preview Content */}
          {book.book_excerpts && (
            <div className="border-t border-gray-400 pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2 text-left">
                  <BookOpen className="h-5 w-5" />
                  Free Preview
              </h2>
              <BookPreview text={book.book_excerpts} className="paragraph text-left" />
            </div>
          )}

          {/* Bullets and Keywords */}
          {((book.bullet_text_1 || book.bullet_text_2 || book.bullet_text_3 || book.bullet_text_4 || book.bullet_text_5) || (book.meta_keywords && book.meta_keywords.length > 0)) && (
            <div className="border-t border-gray-400 pt-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 text-left">More Details</h2>
              
              {/* Bullets */}
              {(book.bullet_text_1 || book.bullet_text_2 || book.bullet_text_3 || book.bullet_text_4 || book.bullet_text_5) && (
                <div className="mb-4">
                  <span className="font-semibold text-gray-900">Highlights: </span>
                  <ul className="list-disc pl-5 text-gray-700">
                    {book.bullet_text_1 && <li className="text-gray-700">{book.bullet_text_1}</li>}
                    {book.bullet_text_2 && <li className="text-gray-700">{book.bullet_text_2}</li>}
                    {book.bullet_text_3 && <li className="text-gray-700">{book.bullet_text_3}</li>}
                    {book.bullet_text_4 && <li className="text-gray-700">{book.bullet_text_4}</li>}
                    {book.bullet_text_5 && <li className="text-gray-700">{book.bullet_text_5}</li>}
                  </ul>
                </div>
              )}
              {/* Keywords */}
              {book.meta_keywords && book.meta_keywords.length > 0 && (
                <div className="mb-4">
                  <span className="font-semibold text-gray-900">Keywords: </span>
                  <span className="text-gray-700">{book.meta_keywords.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer Section */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="text-xs text-gray-500 leading-relaxed">
              <p className="mb-2">
                <strong>Disclaimer:</strong> This website contains affiliate links to various online bookstores. 
                When you click on these links and make a purchase, we may earn a small commission at no additional cost to you. 
                All prices displayed are for informational purposes only and may not reflect current prices at the time of purchase. 
                Prices and availability are subject to change without notice.
              </p>
              <p className="mb-2">
                While we strive to provide accurate and up-to-date information about books, we cannot guarantee the completeness 
                or accuracy of all information displayed. Book details and descriptions are provided &quot;as is&quot; and may contain errors or omissions.
              </p>
              <p>
                Book covers, titles, and author information are the property of their respective copyright holders. 
                We use this information under fair use principles for informational and educational purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 