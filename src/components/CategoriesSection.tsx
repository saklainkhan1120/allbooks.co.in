'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoriesSectionProps {
  genresData: Array<{ category: string; count: number }>;
}

export const CategoriesSection = ({ genresData }: CategoriesSectionProps) => {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
        <div className="flex items-center gap-3">
          <Link href="/categories" className="text-purple-600 hover:text-purple-700 font-medium whitespace-nowrap">
            View All
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const container = document.getElementById('categories-scroll');
              if (container) {
                container.scrollBy({ left: -300, behavior: 'smooth' });
              }
            }}
            className="h-10 w-10 rounded-full !bg-white !border-gray-200 hover:!bg-gray-50 shadow-sm"
          >
            <ChevronLeft className="h-5 w-5 !text-gray-500" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const container = document.getElementById('categories-scroll');
              if (container) {
                container.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
            className="h-10 w-10 rounded-full !bg-white !border-gray-200 hover:!bg-gray-50 shadow-sm"
          >
            <ChevronRight className="h-5 w-5 !text-gray-500" />
          </Button>
        </div>
      </div>
      <div 
        id="categories-scroll"
        className="flex flex-nowrap overflow-x-auto gap-4 pb-12 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {genresData?.slice(0, 20).map((genreItem: { category: string; count: number }) => {
          // Enhanced category colors with vibrant UI-friendly options
          const getCategoryStyle = (category: string) => {
            const styles = {
              'Classics': { bg: 'bg-amber-300', text: 'text-amber-900' },
              'Self-Help': { bg: 'bg-blue-300', text: 'text-blue-900' },
              'Nonfiction': { bg: 'bg-green-300', text: 'text-green-900' },
              'Literature & Fiction': { bg: 'bg-purple-300', text: 'text-purple-900' },
              'Philosophy': { bg: 'bg-indigo-300', text: 'text-indigo-900' },
              'History': { bg: 'bg-red-300', text: 'text-red-900' },
              'Christian Books & Bibles': { bg: 'bg-yellow-300', text: 'text-yellow-900' },
              'Exam Preparation': { bg: 'bg-pink-300', text: 'text-pink-900' },
              'Mystery & Suspense': { bg: 'bg-gray-300', text: 'text-gray-900' },
              'Spirituality': { bg: 'bg-teal-300', text: 'text-teal-900' },
              'Children\'s Fiction': { bg: 'bg-orange-300', text: 'text-orange-900' },
              'School Books': { bg: 'bg-cyan-300', text: 'text-cyan-900' },
              'Religion': { bg: 'bg-lime-300', text: 'text-lime-900' },
              'Biographies': { bg: 'bg-rose-300', text: 'text-rose-900' },
              'Reference': { bg: 'bg-slate-300', text: 'text-slate-900' },
              'Personal Transformation': { bg: 'bg-emerald-300', text: 'text-emerald-900' },
              'Fiction': { bg: 'bg-violet-300', text: 'text-violet-900' },
              'Poetry': { bg: 'bg-fuchsia-300', text: 'text-fuchsia-900' },
              'Drama & Plays': { bg: 'bg-sky-300', text: 'text-sky-900' },
              'Short Stories': { bg: 'bg-amber-200', text: 'text-amber-800' },
              'Contemporary': { bg: 'bg-blue-200', text: 'text-blue-800' },
              'Crime': { bg: 'bg-red-200', text: 'text-red-800' },
              'Thriller': { bg: 'bg-orange-200', text: 'text-orange-800' },
              'Biographies & Memoirs': { bg: 'bg-green-200', text: 'text-green-800' },
              'Comics & Graphic Novels': { bg: 'bg-purple-200', text: 'text-purple-800' },
              'Education & Reference': { bg: 'bg-indigo-200', text: 'text-indigo-800' },
              'Hinduism': { bg: 'bg-yellow-200', text: 'text-yellow-800' },
              'Christianity': { bg: 'bg-blue-100', text: 'text-blue-800' },
              'NTSE': { bg: 'bg-green-200', text: 'text-green-800' },
              'Books': { bg: 'bg-purple-200', text: 'text-purple-800' },
              'Uncategorized': { bg: 'bg-gray-200', text: 'text-gray-800' },
              'CBSE Reference': { bg: 'bg-cyan-200', text: 'text-cyan-800' },
              'SSC Exam': { bg: 'bg-lime-200', text: 'text-lime-800' },
              'AIIMS & NEET': { bg: 'bg-emerald-200', text: 'text-emerald-800' },
              'JEE': { bg: 'bg-teal-200', text: 'text-teal-800' }
            };
            
            // Try exact match first
            if (styles[category as keyof typeof styles]) {
              return styles[category as keyof typeof styles];
            }
            
            // Try partial matches for better color distribution
            const categoryLower = category.toLowerCase();
            if (categoryLower.includes('fiction')) return { bg: 'bg-violet-300', text: 'text-violet-900' };
            if (categoryLower.includes('poetry')) return { bg: 'bg-fuchsia-300', text: 'text-fuchsia-900' };
            if (categoryLower.includes('drama')) return { bg: 'bg-sky-300', text: 'text-sky-900' };
            if (categoryLower.includes('short')) return { bg: 'bg-amber-200', text: 'text-amber-800' };
            if (categoryLower.includes('contemporary')) return { bg: 'bg-blue-200', text: 'text-blue-800' };
            if (categoryLower.includes('crime')) return { bg: 'bg-red-200', text: 'text-red-800' };
            if (categoryLower.includes('thriller')) return { bg: 'bg-orange-200', text: 'text-orange-800' };
            if (categoryLower.includes('biography')) return { bg: 'bg-green-200', text: 'text-green-800' };
            if (categoryLower.includes('comic')) return { bg: 'bg-purple-200', text: 'text-purple-800' };
            if (categoryLower.includes('education')) return { bg: 'bg-indigo-200', text: 'text-indigo-800' };
            if (categoryLower.includes('hinduism')) return { bg: 'bg-yellow-200', text: 'text-yellow-800' };
            if (categoryLower.includes('christianity')) return { bg: 'bg-blue-100', text: 'text-blue-800' };
            if (categoryLower.includes('ntse')) return { bg: 'bg-green-200', text: 'text-green-800' };
            if (categoryLower.includes('books')) return { bg: 'bg-purple-200', text: 'text-purple-800' };
            if (categoryLower.includes('cbse')) return { bg: 'bg-cyan-200', text: 'text-cyan-800' };
            if (categoryLower.includes('ssc')) return { bg: 'bg-lime-200', text: 'text-lime-800' };
            if (categoryLower.includes('aiims') || categoryLower.includes('neet')) return { bg: 'bg-emerald-200', text: 'text-emerald-800' };
            if (categoryLower.includes('jee')) return { bg: 'bg-teal-200', text: 'text-teal-800' };
            
            // Default fallback with vibrant colors
            const fallbackColors = [
              { bg: 'bg-pink-300', text: 'text-pink-900' },
              { bg: 'bg-cyan-300', text: 'text-cyan-900' },
              { bg: 'bg-lime-300', text: 'text-lime-900' },
              { bg: 'bg-rose-300', text: 'text-rose-900' },
              { bg: 'bg-slate-300', text: 'text-slate-900' },
              { bg: 'bg-emerald-300', text: 'text-emerald-900' },
              { bg: 'bg-violet-300', text: 'text-violet-900' },
              { bg: 'bg-fuchsia-300', text: 'text-fuchsia-900' },
              { bg: 'bg-sky-300', text: 'text-sky-900' },
              { bg: 'bg-amber-200', text: 'text-amber-800' }
            ];
            
            // Use category name hash to consistently assign colors
            const hash = category.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0);
            return fallbackColors[Math.abs(hash) % fallbackColors.length];
          };

          const style = getCategoryStyle(genreItem.category || '');
          
          return (
            <div key={genreItem.category} className="group flex flex-col items-center flex-shrink-0 relative">
              <Link
                href={`/genre/${encodeURIComponent(genreItem.category || '')}`}
                className={`relative block p-2 ${style.bg} ${style.text} rounded-full hover:shadow-lg transition-all duration-300 text-center aspect-square flex flex-col items-center justify-center hover:scale-110 transform w-20 h-20 sm:w-24 sm:h-24 z-10`}
              >
                <h3 className="font-bold text-xs leading-tight mb-1 truncate w-full px-1">
                  {genreItem.category}
                </h3>
                <p className="text-xs opacity-90">({genreItem.count})</p>
              </Link>
              
              {/* Full category name appears below the circle on hover - absolutely positioned */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 h-8 flex justify-center pointer-events-none">
                <span className="text-sm font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {genreItem.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-center mt-6">
        <Link href="/categories" className="text-[#007399] hover:underline font-medium">
          View All Categories →
        </Link>
      </div>
    </section>
  );
};
