'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { searchBooksForDeals, addDailyDeal } from '@/lib/deals';

interface SearchAndAddDealsProps {
  onDealAdded?: () => void;
}

export const SearchAndAddDeals: React.FC<SearchAndAddDealsProps> = ({ onDealAdded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingDeal, setIsAddingDeal] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a search term.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await searchBooksForDeals(searchTerm);
      
      if (error) {
        throw error;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "Failed to search books.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddDeal = async (asin: string) => {
    // Validate ASIN format
    if (asin.length !== 10 || !/^[A-Z0-9]{10}$/.test(asin)) {
      toast({
        title: "Invalid ASIN Format",
        description: `ASIN must be exactly 10 alphanumeric characters.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsAddingDeal(true);
    try {
      // Check if deal already exists
      const existingDealResponse = await fetch(`/api/deals/check-deal?asin=${asin}`);
      const existingDealData = await existingDealResponse.json();

      if (existingDealData.data) {
        toast({
          title: "Deal Already Exists",
          description: `Book with ASIN ${asin} is already in daily deals.`,
          variant: "destructive",
        });
        return;
      }

      // Get current max position
      const maxPositionResponse = await fetch('/api/deals/max-position');
      const maxPositionData = await maxPositionResponse.json();
      
      let newPosition: number;
      
      if (maxPositionData.error) {
        // Fallback: try without ordering
        const fallbackResponse = await fetch('/api/deals/all-positions');
        const fallbackData = await fallbackResponse.json();
        
        const maxPosition = fallbackData.data ? Math.max(...fallbackData.data.map((d: any) => d.position || 0)) : 0;
        newPosition = maxPosition + 1;
      } else {
        newPosition = (maxPositionData.data || 0) + 1;
      }
      
      const { error } = await addDailyDeal({
        asin,
        position: newPosition,
        is_top_six: false,
        is_fixed_position: false
      });
      
      if (error) {
        throw error;
      }

      toast({
        title: "Deal Added",
        description: `Book with ASIN ${asin} has been added to daily deals.`,
      });
      
      setSearchTerm(''); // Clear search term after adding
      setSearchResults([]);
      onDealAdded?.(); // Callback to refresh parent component
    } catch (error) {
      console.error('Error adding deal:', error);
      toast({
        title: "Failed to Add Deal",
        description: error instanceof Error ? error.message : "Failed to add deal.",
        variant: "destructive",
      });
    } finally {
      setIsAddingDeal(false);
    }
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Search className="h-5 w-5" />
          Search & Add Books to Deals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Search for books by ASIN or title and add them to daily deals. 
            Only books that exist in the database can be added.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-2">
          <Input
            placeholder="Search by ASIN or book title..."
            className="flex-1 border border-gray-300 text-gray-900 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching} className="bg-blue-600 hover:bg-blue-700 text-white">
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Search Results ({searchResults.length})</h4>
            {searchResults.map((book) => (
              <Card key={book.asin} className="p-3 bg-white border border-gray-200">
                <div className="flex items-center gap-3">
                  <img
                    src={book.cover_image_url || '/placeholder.svg'}
                    alt={book.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm line-clamp-2 text-gray-900">{book.title}</h5>
                    <p className="text-xs text-gray-600">{book.author}</p>
                    <p className="text-xs text-gray-500">{book.asin}</p>
                    {book.inr_price && (
                      <p className="text-xs font-medium text-gray-900">₹{book.inr_price}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddDeal(book.asin)}
                    disabled={isAddingDeal}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {searchTerm && searchResults.length === 0 && !isSearching && (
          <div className="text-center py-8 text-gray-500">
            No books found matching your search
          </div>
        )}
        
        {!searchTerm && searchResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Search for books to add to daily deals
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 