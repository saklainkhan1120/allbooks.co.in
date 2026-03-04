import { Metadata } from "next";
import { BookCarousel } from "@/components/BookCarousel";
import Link from "next/link";
import { getBestsellers, getNewReleases, getJustListed, getDailyDeals, getGenres } from "@/lib/data";
import { CategoriesSection } from '@/components/CategoriesSection';

export const metadata: Metadata = {
  title: "allBooks.co.in - Your Ultimate Book Discovery Platform | Find Millions of Books",
  description: "Discover millions of books across all genres at allBooks.co.in. Find your next favorite read with detailed reviews, author information, and the best prices. Browse bestsellers, new releases, and just listed books.",
  keywords: ['books', 'book catalog', 'reading', 'literature', 'authors', 'publishers', 'book discovery', 'allbooks', 'online bookstore', 'book search'],
  openGraph: {
    title: "allBooks.co.in - Your Ultimate Book Discovery Platform",
    description: "Discover millions of books across all genres. Search by title, author, ISBN, or ASIN.",
    type: "website",
  },
};

// Force dynamic so we never try to run DB queries at build time (avoids PrismaClientInitializationError when DB is unavailable).
export const dynamic = 'force-dynamic';
// Optional: revalidate every 30 minutes when DB is available
export const revalidate = 1800;

export default async function HomePage() {
  const [bestsellersData, newReleasesData, justListedData, dailyDealsData, genresData] = await Promise.all([
    getBestsellers(1, 30),
    getNewReleases(1, 30),
    getJustListed(1, 30),
    getDailyDeals(),
    getGenres(),
  ]);

  const bestSellers = bestsellersData.books || [];
  const newReleases = newReleasesData.books || [];
  const justListed = justListedData.books || [];
  const dailyDeals = dailyDealsData?.books?.map((deal: any) => ({
    ...deal,
    id: deal.id || deal.asin,
    main_genre: deal.main_genre || ''
  })) || [];

  return (
    <div className="bg-white">
        {/* Hero Section */}
        <section className="py-6 sm:py-8 md:py-12 px-4 text-center bg-purple-50">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Tagline Banner */}
            <div className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wide mb-4 sm:mb-6">
              Your Portal to Infinite Stories
            </div>
            
            {/* Main Heading - H1 for SEO */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-gray-900 leading-tight">
              Discover Millions of Books at allBooks.co.in
            </h1>
            
            {/* Descriptive Text */}
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed px-2">
              Dive into a universe of books. From timeless classics to the latest page-turners, your next adventure awaits. Browse our extensive collection of books across all genres including fiction, non-fiction, science fiction, romance, mystery, and more.
            </p>
            
            {/* Search Bar */}
            <form 
              className="max-w-md sm:max-w-lg mx-auto px-2"
              action="/search"
              method="GET"
            >
              <div className="flex items-center bg-white border-2 border-gray-200 rounded-full overflow-hidden shadow-md hover:border-purple-300 transition-colors">
                <div className="flex items-center px-4 py-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                </div>
                <input
                  name="q"
                  className="flex-1 px-0 py-3 border-0 focus:outline-none focus:ring-0 text-base placeholder-gray-500 text-gray-900"
                  placeholder="Search for books, authors, or genres..."
                  autoComplete="off"
                />
                <button 
                  type="submit" 
                  className="bg-purple-600 text-white px-4 sm:px-6 py-3 text-sm font-semibold hover:bg-purple-700 transition-all duration-200 border-l border-gray-200 rounded-r-full"
                >
                  <span className="hidden sm:inline">Search</span>
                  <svg className="sm:hidden w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Featured Sections */}
        <div className="container mx-auto px-2 py-8">
          {/* Quick Navigation Links for SEO */}
          <section className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Link href="/bestsellers" className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <h3 className="font-semibold text-blue-900">Best Sellers</h3>
                <p className="text-sm text-blue-700">Top rated books</p>
              </Link>
              <Link href="/new-releases" className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <h3 className="font-semibold text-green-900">New Releases</h3>
                <p className="text-sm text-green-700">Latest books</p>
              </Link>
              <Link href="/just-listed" className="text-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <h3 className="font-semibold text-purple-900">Just Listed</h3>
                <p className="text-sm text-purple-700">Recently added</p>
              </Link>
              <Link href="/authors" className="text-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <h3 className="font-semibold text-orange-900">Authors</h3>
                <p className="text-sm text-orange-700">Browse by author</p>
              </Link>
            </div>
            
            {/* Additional Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/categories" className="text-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                <h3 className="font-semibold text-indigo-900">Categories</h3>
                <p className="text-sm text-indigo-700">Browse by genre</p>
              </Link>
              <Link href="/publishers" className="text-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                <h3 className="font-semibold text-teal-900">Publishers</h3>
                <p className="text-sm text-teal-700">Browse by publisher</p>
              </Link>
              <Link href="/search" className="text-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                <h3 className="font-semibold text-pink-900">Search</h3>
                <p className="text-sm text-pink-700">Find specific books</p>
              </Link>
              <Link href="/about" className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <h3 className="font-semibold text-gray-900">About</h3>
                <p className="text-sm text-gray-700">Learn more</p>
              </Link>
            </div>
          </section>

          {/* Bestsellers Section */}
          <section className="mb-12 pl-4 sm:pl-6 lg:pl-8">
            <BookCarousel 
              books={bestSellers} 
              viewAllHref="/bestsellers"
              title="Top 500 Bestsellers"
            />
          </section>

          {/* New Releases Section */}
          <section className="mb-12 pl-4 sm:pl-6 lg:pl-8">
            <BookCarousel 
              books={newReleases} 
              viewAllHref="/new-releases"
              title="Top 500 New Releases"
            />
          </section>

          {/* Just Listed Section */}
          <section className="mb-12 pl-4 sm:pl-6 lg:pl-8">
            <BookCarousel 
              books={justListed} 
              viewAllHref="/just-listed"
              title="Just Listed"
            />
          </section>

          {/* Daily Deals Section */}
          <section className="mb-12 pl-4 sm:pl-6 lg:pl-8">
            <BookCarousel 
              books={dailyDeals} 
              viewAllHref="/daily-deals"
              title="Daily Deals"
            />
          </section>

          {/* Categories Section - Now using Client Component */}
          <CategoriesSection genresData={genresData} />

          {/* Additional SEO Content */}
          <section className="mt-12 py-8 bg-gray-50 rounded-lg pl-4 sm:pl-6 lg:pl-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose allBooks.co.in?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Extensive Collection</h3>
                  <p className="text-gray-600">Browse millions of books across all genres, from <Link href="/categories" className="text-blue-600 hover:underline">classic literature</Link> to <Link href="/new-releases" className="text-blue-600 hover:underline">contemporary bestsellers</Link>.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Detailed Information</h3>
                  <p className="text-gray-600">Get comprehensive book details including <Link href="/authors" className="text-blue-600 hover:underline">author information</Link>, reviews, and pricing from multiple retailers.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Easy Discovery</h3>
                  <p className="text-gray-600">Find your next read with our <Link href="/search" className="text-blue-600 hover:underline">advanced search</Link> and filtering options by genre, author, and publisher.</p>
                </div>
              </div>
              
              {/* Popular Genres Section */}
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Popular Book Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link href="/genre/fiction" className="text-blue-600 hover:text-blue-800 text-sm">Fiction</Link>
                  <Link href="/genre/non-fiction" className="text-blue-600 hover:text-blue-800 text-sm">Non-Fiction</Link>
                  <Link href="/genre/science-fiction" className="text-blue-600 hover:text-blue-800 text-sm">Science Fiction</Link>
                  <Link href="/genre/romance" className="text-blue-600 hover:text-blue-800 text-sm">Romance</Link>
                  <Link href="/genre/mystery" className="text-blue-600 hover:text-blue-800 text-sm">Mystery</Link>
                  <Link href="/genre/thriller" className="text-blue-600 hover:text-blue-800 text-sm">Thriller</Link>
                  <Link href="/genre/biography" className="text-blue-600 hover:text-blue-800 text-sm">Biography</Link>
                  <Link href="/genre/history" className="text-blue-600 hover:text-blue-800 text-sm">History</Link>
                </div>
              </div>
              
              {/* Call to Action */}
              <div className="mt-8">
                <p className="text-gray-600 mb-4">
                  Start exploring our vast collection of books today. Whether you&apos;re looking for <Link href="/bestsellers" className="text-blue-600 hover:underline">best sellers</Link>, 
                  <Link href="/new-releases" className="text-blue-600 hover:underline"> new releases</Link>, or <Link href="/just-listed" className="text-blue-600 hover:underline">recently added books</Link>, 
                  we have something for every reader.
                </p>
                <Link href="/search" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Start Searching
                </Link>
              </div>
            </div>
          </section>
        </div>
    </div>
  );
}
