'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  Upload,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface BestsellerBook {
  id: string;
  asin: string;
  title: string;
  author?: string;
  cover_image_url?: string;
  inr_price?: number;
  added_date?: string;
  sort_order?: number;
}

export const BestsellerManagement: React.FC = () => {
  const { toast } = useToast();
  const [bulkAsins, setBulkAsins] = useState('');
  const [singleAsin, setSingleAsin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bestsellers, setBestsellers] = useState<BestsellerBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load bestsellers
  const loadBestsellers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/bestsellers');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load bestsellers');
      }

      setBestsellers(data.books || []);
    } catch (error) {
      console.error('Error loading bestsellers:', error);
      toast({
        title: "Error",
        description: "Failed to load bestsellers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBestsellers();
  }, []);

  const handleAddSingleBestseller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleAsin.trim()) {
      toast({
        title: "Error",
        description: "Please enter an ASIN",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/bestsellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add-single',
          asin: singleAsin.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add bestseller');
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Book with ASIN ${singleAsin} added to bestsellers`,
        });
        setSingleAsin('');
        // Reload bestsellers after successful addition
        setTimeout(() => loadBestsellers(), 1000);
      } else {
        toast({
          title: "Error",
          description: result.error || "Book not found or already in bestsellers",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add bestseller",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAddBestsellers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkAsins.trim()) {
      toast({
        title: "Error",
        description: "Please enter ASINs",
        variant: "destructive",
      });
      return;
    }

    const asins = bulkAsins.split('\n').filter(asin => asin.trim());
    if (asins.length === 0) {
      toast({
        title: "Error",
        description: "Please enter valid ASINs",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/bestsellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add-bulk',
          asins: asins
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add bestsellers');
      }

      const successCount = result.results.filter((r: any) => r.success).length;
      const errorCount = result.results.filter((r: any) => !r.success).length;

      toast({
        title: "Bulk Add Complete",
        description: `Added ${successCount} books, ${errorCount} failed`,
      });

      if (successCount > 0) {
        setBulkAsins('');
        // Reload bestsellers after successful bulk addition
        setTimeout(() => loadBestsellers(), 1000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add books to bestsellers",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveBestseller = async (asin: string) => {
    try {
      const response = await fetch(`/api/admin/bestsellers?asin=${asin}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove bestseller');
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Book with ASIN ${asin} removed from bestsellers`,
        });
        // Reload bestsellers after successful removal
        setTimeout(() => loadBestsellers(), 1000);
      } else {
        toast({
          title: "Error",
          description: result.error || "Book not found in bestsellers",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove bestseller",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold">Bestseller Management</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Bestsellers</span>
            </div>
            <p className="text-2xl font-bold mt-2">{bestsellers.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Single Bestseller */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Single Bestseller
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSingleBestseller} className="space-y-4">
            <div>
              <Label htmlFor="single-asin">Book ASIN</Label>
              <Input
                id="single-asin"
                value={singleAsin}
                onChange={(e) => setSingleAsin(e.target.value)}
                placeholder="Enter book ASIN (e.g., B08N5WRWNW)"
                className="mt-1"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isProcessing || !singleAsin.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? 'Adding...' : 'Add to Bestsellers'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bulk Add Bestsellers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Bulk Add Bestsellers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBulkAddBestsellers} className="space-y-4">
            <div>
              <Label htmlFor="bulk-asins">Book ASINs (one per line)</Label>
              <Textarea
                id="bulk-asins"
                value={bulkAsins}
                onChange={(e) => setBulkAsins(e.target.value)}
                placeholder="Enter ASINs, one per line:&#10;B08N5WRWNW&#10;B08N5WRWNW&#10;B08N5WRWNW"
                rows={6}
                className="mt-1"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isProcessing || !bulkAsins.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Adding...' : 'Bulk Add to Bestsellers'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Current Bestsellers */}
      <Card>
        <CardHeader>
          <CardTitle>Current Bestsellers ({bestsellers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading bestsellers...</p>
            </div>
          ) : bestsellers.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bestsellers added yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>ASIN</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bestsellers.map((book) => (
                    <TableRow key={book.asin}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {book.cover_image_url && (
                            <img 
                              src={book.cover_image_url} 
                              alt={book.title}
                              className="w-12 h-16 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/placeholder.svg';
                              }}
                            />
                          )}
                          <div>
                            <p className="font-medium">{book.title}</p>
                            {book.inr_price && (
                              <p className="text-sm text-gray-600">₹{book.inr_price}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {book.asin}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {book.added_date ? new Date(book.added_date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveBestseller(book.asin)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 