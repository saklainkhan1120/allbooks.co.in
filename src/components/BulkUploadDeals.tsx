'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { bulkUploadAsinsToDeals } from '@/lib/deals';

interface BulkUploadDealsProps {
  onDealsAdded?: () => void;
}

export const BulkUploadDeals: React.FC<BulkUploadDealsProps> = ({ onDealsAdded }) => {
  const [bulkAsins, setBulkAsins] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { toast } = useToast();

  const handleBulkUpload = async () => {
    if (!bulkAsins.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter ASINs to upload.",
        variant: "destructive",
      });
      return;
    }

    // Parse ASINs from text
    const asins = bulkAsins
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Extract ASIN from various formats
        const asinMatch = line.match(/[A-Z0-9]{10}/);
        return asinMatch ? asinMatch[0] : line;
      })
      .filter(asin => asin.length === 10);

    if (asins.length === 0) {
      toast({
        title: "No Valid ASINs",
        description: "No valid ASINs found in the input. Each ASIN must be exactly 10 alphanumeric characters.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await bulkUploadAsinsToDeals(asins);
      setUploadResult(result);

      if (result.error) {
        toast({
          title: "Upload Completed with Errors",
          description: `Added ${result.validCount} deals. ${result.error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload Successful",
          description: `Successfully added ${result.validCount} deals to daily deals.`,
        });
        setBulkAsins(''); // Clear input after successful upload
        onDealsAdded?.(); // Callback to refresh parent component
      }
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload ASINs.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setBulkAsins('');
    setUploadResult(null);
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Upload className="h-5 w-5" />
          Bulk Upload ASINs to Deals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Enter ASINs (one per line) to bulk add books to daily deals. 
            Only valid ASINs that exist in the database will be added.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            ASINs (one per line)
          </label>
          <Textarea
            placeholder="Enter ASINs here, one per line...
Example:
B08N5WRWNW
B08N5WRWNW
B08N5WRWNW"
            className="min-h-32 border border-gray-300 text-gray-900 bg-white"
            value={bulkAsins}
            onChange={(e) => setBulkAsins(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleBulkUpload} 
            disabled={isUploading || !bulkAsins.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isUploading ? 'Uploading...' : 'Upload ASINs'}
          </Button>
          <Button 
            onClick={handleClear}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Clear
          </Button>
        </div>
        
        {/* Upload Result */}
        {uploadResult && (
          <Card className="bg-gray-50 border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {uploadResult.error ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <h4 className="font-medium text-gray-900">
                  Upload Result
                </h4>
              </div>
              
              <div className="space-y-1 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Total ASINs:</span> {uploadResult.totalCount}
                </p>
                <p className="text-green-700">
                  <span className="font-medium">Successfully Added:</span> {uploadResult.validCount}
                </p>
                {uploadResult.error && (
                  <p className="text-red-700">
                    <span className="font-medium">Errors:</span> {uploadResult.error.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}; 