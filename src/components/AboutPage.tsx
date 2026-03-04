'use client';

import { BookOpen, Users, Globe, Award, Heart, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About allBooks.co.in
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Your ultimate destination for discovering amazing books. From bestsellers to hidden gems, 
              we help you find your next great read with our curated collection of over 100,000+ books.
            </p>
          </div>

          {/* Mission Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
            <div className="flex items-center mb-6">
              <BookOpen className="h-8 w-8 text-blue-600 mr-4" />
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              At allBooks.co.in, we believe that every reader deserves access to the world&apos;s best literature. 
              Our mission is to connect book lovers with their perfect reads through intelligent recommendations, 
              comprehensive search capabilities, and a vast collection spanning all genres and interests.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Whether you&apos;re a student looking for academic resources, a fiction enthusiast seeking your next 
              adventure, or a professional expanding your knowledge, we&apos;re here to guide your literary journey.
            </p>
          </div>

          {/* What We Offer Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What We Offer</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link href="/bestsellers" className="group">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <Award className="h-6 w-6 text-green-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Discover Trending Bestsellers</div>
                  </div>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 flex-grow">
                    Discover trending books and timeless classics that are making waves in the literary world. 
                    Our bestsellers section is constantly updated with the most popular reads.
                  </p>
                </div>
              </Link>

              <Link href="/new-releases" className="group">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 text-blue-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Stay Updated with New Releases</div>
                  </div>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 flex-grow">
                    Stay ahead with the latest publications from renowned authors and emerging voices. 
                    Be among the first to discover groundbreaking new titles.
                  </p>
                </div>
              </Link>

              <Link href="/categories" className="group">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <Globe className="h-6 w-6 text-purple-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Browse Comprehensive Categories</div>
                  </div>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 flex-grow">
                    Explore books across diverse categories including fiction, non-fiction, academic, 
                    children&apos;s literature, and specialized subjects.
                  </p>
                </div>
              </Link>

              <Link href="/authors" className="group">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <Users className="h-6 w-6 text-orange-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Explore Author Collections</div>
                  </div>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 flex-grow">
                    Browse books by your favorite authors or discover new writers across different genres 
                    and writing styles.
                  </p>
                </div>
              </Link>

              <Link href="/daily-deals" className="group">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <Heart className="h-6 w-6 text-red-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Find Amazing Daily Deals</div>
                  </div>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 flex-grow">
                    Find incredible discounts on premium books with our daily deals. 
                    Quality reading shouldn&apos;t break the bank.
                  </p>
                </div>
              </Link>

              <Link href="/search" className="group">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <Shield className="h-6 w-6 text-indigo-600 mr-3 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Get Personalized Recommendations</div>
                  </div>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 flex-grow">
                    Get personalized book suggestions based on your reading preferences and 
                    discover hidden gems you might have missed.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose allBooks.co.in?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="text-xl font-semibold text-gray-900 mb-4">Extensive Collection</div>
                <p className="text-gray-600 mb-6">
                  With over 100,000+ books in our database, we offer one of the most comprehensive 
                  collections available online. From academic textbooks to popular fiction, we have 
                  something for every reader.
                </p>
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900 mb-4">Advanced Search</div>
                <p className="text-gray-600 mb-6">
                  Our powerful search engine allows you to find books by title, author, ISBN, 
                  publisher, or even specific keywords. Filter by price, genre, and publication date.
                </p>
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900 mb-4">Detailed Information</div>
                <p className="text-gray-600 mb-6">
                  Get comprehensive book details including author information, publication details, 
                  pricing, and reader reviews to make informed decisions.
                </p>
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900 mb-4">User-Friendly Experience</div>
                <p className="text-gray-600 mb-6">
                  Our intuitive interface makes book discovery effortless. Browse categories, 
                  explore recommendations, and find your next favorite read with ease.
                </p>
              </div>
            </div>
          </div>

          {/* Our Categories Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Explore Our Categories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href="/categories" className="group">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-center">
                  <div className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">Fiction</div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Novels, short stories, and literary works</p>
                </div>
              </Link>
              <Link href="/categories" className="group">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-center">
                  <div className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">Non-Fiction</div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Biographies, history, and self-help</p>
                </div>
              </Link>
              <Link href="/categories" className="group">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-center">
                  <div className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">Academic</div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Textbooks and educational resources</p>
                </div>
              </Link>
              <Link href="/categories" className="group">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-center">
                  <div className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">Children&apos;s Books</div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Picture books and young adult literature</p>
                </div>
              </Link>
              <Link href="/categories" className="group">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-center">
                  <div className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">Science & Technology</div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Technical and scientific literature</p>
                </div>
              </Link>
              <Link href="/categories" className="group">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-center">
                  <div className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">Business & Finance</div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Professional and business resources</p>
                </div>
              </Link>
              <Link href="/categories" className="group">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-center">
                  <div className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">Health & Wellness</div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Medical and lifestyle books</p>
                </div>
              </Link>
              <Link href="/categories" className="group">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col justify-center">
                  <div className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">Arts & Culture</div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Creative and cultural literature</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Discover Your Next Great Read?</h2>
            <p className="text-xl mb-6 opacity-90">
              Start exploring our vast collection of books today and find your perfect match.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/search" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                Browse Books
              </Link>
              <Link 
                href="/categories" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
              >
                Explore Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 