'use client';

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export const SearchBar = ({ 
  onSearch, 
  placeholder = "Search books, authors, or tags...", 
  className = "", 
  initialValue = "" 
}: SearchBarProps) => {
  const [query, setQuery] = useState(initialValue);

  // Update query when initialValue changes (for new searches)
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-3 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-12 h-12 rounded-lg border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-base bg-white shadow-sm text-gray-900"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      <Button 
        type="submit" 
        className="px-8 h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm"
      >
        Search
      </Button>
    </form>
  );
}; 