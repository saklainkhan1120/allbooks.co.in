'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, TrendingUp, Clock, PlusCircle, Grid3X3, User, X } from "lucide-react";
import { useState } from "react";

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Bestsellers", href: "/bestsellers", icon: TrendingUp },
  { name: "New Releases", href: "/new-releases", icon: Clock },
  { name: "Just Listed", href: "/just-listed", icon: PlusCircle },
  { name: "Categories", href: "/categories", icon: Grid3X3 },
  { name: "Authors", href: "/authors", icon: User },
  { name: "About Us", href: "/about", icon: User },
  { name: "Contact", href: "/contact", icon: User },
];

export const Header = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchExpanded(false);
      setSearchQuery("");
    }
  };

  const toggleSearch = () => {
    setSearchExpanded(!searchExpanded);
    if (!searchExpanded) {
      // Focus the search input when expanding
      setTimeout(() => {
        const searchInput = document.getElementById('desktop-search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  const closeSearch = () => {
    setSearchExpanded(false);
    setSearchQuery("");
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
      {/* Main header with brand, navigation, and search */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 relative">
        {/* Brand Identity - Always Visible */}
        <Link href="/" className="flex items-center gap-2 text-xl md:text-2xl font-bold text-gray-900 flex-shrink-0">
          <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM3 19V6h8v13H3zm18 0h-8V6h8v13z"/>
          </svg>
          <span>allBooks.co.in</span>
        </Link>
        
        {/* Desktop Navigation Links - Center */}
        <nav className={cn("hidden lg:flex items-center gap-6 transition-all duration-300", 
          searchExpanded ? "opacity-0 pointer-events-none transform -translate-y-2" : "opacity-100 pointer-events-auto transform translate-y-0")}>
          {navigationItems.map((item) => (
            <Link 
              key={item.name}
              href={item.href} 
              className="text-gray-900 font-medium hover:text-purple-600 transition-colors text-base"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Search Bar - Right */}
        <div className="flex items-center gap-2">
          {/* Search Icon Button */}
          {!searchExpanded && (
            <button 
              className="hidden lg:flex items-center justify-center w-10 h-10 text-gray-600 hover:text-purple-600 transition-colors"
              onClick={toggleSearch}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </button>
          )}

          {/* Mobile Search and Menu Buttons */}
          <div className="lg:hidden flex items-center gap-2">
            <button onClick={() => setMobileSearchOpen(true)} className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-900">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </button>
            <button onClick={() => setMobileMenuOpen(true)} className="p-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-900">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expanded Search Bar - Fixed positioned overlay */}
        {searchExpanded && (
          <div className="hidden lg:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 z-50" style={{ height: '72px' }}>
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 h-full">
              <div className="flex items-center gap-2 text-xl md:text-2xl font-bold text-gray-900 flex-shrink-0">
                <svg className="w-6 h-6 md:w-8 md:h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM3 19V6h8v13H3zm18 0h-8V6h8v13z"/>
                </svg>
                <span>allBooks.co.in</span>
              </div>
              
              <form onSubmit={handleSearch} className="flex items-center gap-0 flex-1 max-w-2xl mx-8">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden focus-within:bg-white focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500 transition-all duration-300 w-full">
                  <div className="flex items-center pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                  </div>
                  <input
                    id="desktop-search-input"
                    name="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-0 py-2 border-0 bg-transparent focus:outline-none focus:ring-0 text-base placeholder-gray-500 text-gray-900"
                    placeholder="Search Books, ISBN, Authors, ASIN..."
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={clearSearch}
                      className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={closeSearch}
                  className="ml-3 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end lg:hidden">
          <div className="w-64 bg-white h-full shadow-lg flex flex-col">
            <button className="self-end p-4" onClick={() => setMobileMenuOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-gray-900">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <nav className="flex flex-col gap-2 px-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="py-3 text-lg text-gray-900 font-medium border-b border-gray-100 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Search Modal */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start pt-24 lg:hidden">
          <div className="bg-white rounded-lg shadow-lg p-6 w-11/12 max-w-md">
            <form className="flex items-center gap-0" onSubmit={e => { 
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                setMobileSearchOpen(false);
                setSearchQuery("");
              }
            }}>
              <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm w-full">
                <div className="flex items-center px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                </div>
                <input
                  name="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-0 py-2 border-0 focus:outline-none focus:ring-0 text-sm placeholder-gray-500 text-gray-900"
                  placeholder="Search Books, ISBN, Authors, ASIN..."
                  autoComplete="off"
                  autoFocus
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={clearSearch}
                    className="px-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
            <button className="mt-4 w-full text-gray-900 font-medium" onClick={() => {
              setMobileSearchOpen(false);
              setSearchQuery("");
            }}>Cancel</button>
          </div>
        </div>
      )}
    </header>
  );
}; 