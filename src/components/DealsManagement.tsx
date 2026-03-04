'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Trash2, 
  Star, 
  Lock, 
  Unlock
} from 'lucide-react';
import { PaginationComponent } from '@/components/PaginationComponent';

interface DailyDealBook {
  id?: string;
  asin: string;
  title: string;
  author?: string;
  cover_image_url?: string;
  inr_price?: number;
  position?: number;
  is_fixed_position?: boolean;
  is_top_six?: boolean;
  created_at?: string;
}

export const DealsManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'all' | 'fixed' | 'top6'>('all');
  const [dealsSearchTerm, setDealsSearchTerm] = useState('');
  const [deals, setDeals] = useState<DailyDealBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();
  
  // Load deals
  const loadDeals = async () => {
    try {
      setIsLoading(true);
      
      // Get all daily deals from our database
      const response = await fetch('/api/deals');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const dealsData = await response.json();

  
      setDeals(dealsData);
    } catch (error) {
      console.error('Error loading deals:', error);
      toast({
        title: "Error",
        description: "Failed to load deals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/deals/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to load stats');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadDeals();
    loadStats();
  }, []);
  
  const handleRefresh = () => {
    loadDeals();
    loadStats();
  };
  
  // Filter and search logic
  const filteredDeals = deals.filter((deal) => {
    // Apply status filter
    if (activeFilter === 'fixed' && !deal.is_fixed_position) return false;
    if (activeFilter === 'top6' && !deal.is_top_six) return false;
    
    // Apply search filter (search by title, author, or ASIN)
    if (dealsSearchTerm) {
      const searchLower = dealsSearchTerm.toLowerCase();
      return (
        (deal.title && deal.title.toLowerCase().includes(searchLower)) ||
        (deal.author && deal.author.toLowerCase().includes(searchLower)) ||
        deal.asin.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Sort deals: fixed first, then top 6, then by created date
  const sortedDeals = [...filteredDeals].sort((a, b) => {
    // Fixed position deals first (positions 1-3)
    if (a.is_fixed_position && !b.is_fixed_position) return -1;
    if (!a.is_fixed_position && b.is_fixed_position) return 1;
    
    // Top 6 deals second
    if (a.is_top_six && !b.is_top_six) return -1;
    if (!a.is_top_six && b.is_top_six) return 1;
    
    // Then by created date (fallback to position if created_at not available)
    const aDate = a.created_at ? new Date(a.created_at).getTime() : (a.position || 0);
    const bDate = b.created_at ? new Date(b.created_at).getTime() : (b.position || 0);
    return aDate - bDate;
  });
  
  // Pagination logic
  const booksPerPage = 25;
  const totalPages = Math.ceil((sortedDeals.length || 0) / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const currentDeals = sortedDeals.slice(startIndex, endIndex);
  
  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, dealsSearchTerm]);

  // Remove deal
  const handleRemoveDeal = async (dealId: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Deal removed successfully",
      });
      
      loadDeals(); // Refresh the list
    } catch (error) {
      console.error('Error removing deal:', error);
      toast({
        title: "Error",
        description: "Failed to remove deal",
        variant: "destructive",
      });
    }
  };

  // Set as top 6
  const handleSetAsTopSix = async (dealId: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}/top-six`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Deal set as top 6",
      });
      
      loadDeals(); // Refresh the list
    } catch (error) {
      console.error('Error setting as top 6:', error);
      toast({
        title: "Error",
        description: "Failed to set as top 6",
        variant: "destructive",
      });
    }
  };

  // Remove from top 6
  const handleRemoveFromTopSix = async (dealId: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}/top-six`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Deal removed from top 6",
      });
      
      loadDeals(); // Refresh the list
    } catch (error) {
      console.error('Error removing from top 6:', error);
      toast({
        title: "Error",
        description: "Failed to remove from top 6",
        variant: "destructive",
      });
    }
  };

  // Set as fixed position
  const handleSetAsFixedPosition = async (dealId: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}/fixed-position`, {
        method: 'PUT',
      });
      if (!response.ok) {
        if (response.status === 429) { // Limit Reached
          toast({
            title: "Limit Reached",
            description: "Maximum 3 fixed position deals allowed",
            variant: "destructive",
          });
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      toast({
        title: "Success",
        description: "Deal set as fixed position",
      });
      
      loadDeals(); // Refresh the list
    } catch (error) {
      console.error('Error setting as fixed position:', error);
      toast({
        title: "Error",
        description: "Failed to set as fixed position",
        variant: "destructive",
      });
    }
  };

  // Remove from fixed position
  const handleRemoveFromFixedPosition = async (dealId: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}/fixed-position`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Deal removed from fixed position",
      });
      
      loadDeals(); // Refresh the list
    } catch (error) {
      console.error('Error removing from fixed position:', error);
      toast({
        title: "Error",
        description: "Failed to remove from fixed position",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      {stats && (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeals}</p>
                <p className="text-sm text-gray-600">Total Deals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.topSixDeals}</p>
                <p className="text-sm text-gray-600">Top Six</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.fixedPositionDeals}</p>
                <p className="text-sm text-gray-600">Fixed Position</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Deals Section */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Star className="h-5 w-5" />
            Current Daily Deals ({sortedDeals.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
                className={activeFilter === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
              >
                All ({deals.length || 0})
              </Button>
              <Button
                variant={activeFilter === 'fixed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('fixed')}
                className={activeFilter === 'fixed' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
              >
                Fixed ({deals.filter(d => d.is_fixed_position).length || 0})
              </Button>
              <Button
                variant={activeFilter === 'top6' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('top6')}
                className={activeFilter === 'top6' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}
              >
                Top 6 ({deals.filter(d => d.is_top_six).length || 0})
              </Button>
            </div>
            
            {/* Search Bar */}
            <div className="flex-1">
              <Input
                placeholder="Search deals by title, author, or ASIN..."
                value={dealsSearchTerm}
                onChange={(e) => setDealsSearchTerm(e.target.value)}
                className="max-w-md text-gray-900 bg-white border border-gray-300"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading deals...</div>
          ) : deals && deals.length > 0 ? (
            <>
              <div className="space-y-3 max-w-4xl">
                {currentDeals.map((deal) => (
                  <Card key={deal.id} className="p-4 bg-white border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-24 bg-gray-100 rounded flex items-center justify-center">
                        {deal.cover_image_url ? (
                          <img src={deal.cover_image_url} alt={deal.title || 'Book Cover'} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xs text-gray-500 text-center">No Image</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 max-w-md">
                        <h5 className="font-medium text-sm line-clamp-2 mb-1 text-gray-900">{deal.title || 'N/A'}</h5>
                        <p className="text-xs text-gray-700 truncate">ASIN: {deal.asin}</p>
                        <p className="text-xs text-gray-600 truncate">Author: {deal.author || 'N/A'}</p>
                        {deal.inr_price && (
                          <p className="text-xs font-medium text-gray-900">₹{deal.inr_price}</p>
                        )}
                        <p className="text-xs text-gray-600 truncate">Position: {deal.position}</p>
                        <p className="text-xs text-gray-600 truncate">Added: {deal.created_at ? new Date(deal.created_at).toLocaleDateString() : 'Unknown'}</p>
                        
                        {/* Status Badges */}
                        <div className="flex gap-1 mt-2">
                          {deal.is_fixed_position && (
                            <Badge variant="destructive" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Fixed
                            </Badge>
                          )}
                          {deal.is_top_six && !deal.is_fixed_position && (
                            <Badge variant="default" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Top 6
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {deal.is_top_six ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveFromTopSix(deal.id!)}
                            className="text-orange-600 hover:text-orange-700 border-gray-300"
                            title="Remove from top 6"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetAsTopSix(deal.id!)}
                            disabled={deal.is_top_six}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            title="Set as top 6"
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        )}
                        {deal.is_fixed_position ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveFromFixedPosition(deal.id!)}
                            className="text-orange-600 hover:text-orange-700 border-gray-300"
                            title="Remove from fixed position"
                          >
                            <Unlock className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetAsFixedPosition(deal.id!)}
                            disabled={deal.is_fixed_position}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            title="Set as fixed position"
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveDeal(deal.id!)}
                          className="text-red-600 hover:text-red-700 border-gray-300"
                          title="Remove from deals"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No daily deals found. Add some books to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 