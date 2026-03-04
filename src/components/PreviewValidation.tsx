'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Upload, Download, X } from 'lucide-react';

interface ParsedBook {
  data: any | null;
  originalData: any;
  errors: string[];
  rowNumber: number;
}

interface ValidationSummary {
  totalBooks: number;
  validBooks: number;
  invalidBooks: number;
  errorCategories: {
    missingFields: number;
    invalidFormats: number;
    duplicates: number;
    databaseDuplicates: number;
  };
  errorsByRow: { [rowNumber: number]: string[] };
}

interface PreviewValidationProps {
  parsedData: ParsedBook[];
  onUpload: () => void;
  onExportFailed: () => void;
  onCancel: () => void;
}

const PreviewValidation: React.FC<PreviewValidationProps> = ({
  parsedData,
  onUpload,
  onExportFailed,
  onCancel
}) => {
  // Calculate validation summary
  const validBooks = parsedData.filter(book => book.errors.length === 0 && book.data !== null);
  const invalidBooks = parsedData.filter(book => book.errors.length > 0 || book.data === null);
  
  const errorCategories = {
    missingFields: 0,
    invalidFormats: 0,
    duplicates: 0,
    databaseDuplicates: 0
  };

  invalidBooks.forEach(book => {
    book.errors.forEach(error => {
      if (error.includes('Missing required field')) {
        errorCategories.missingFields++;
      } else if (error.includes('must be exactly') || error.includes('invalid')) {
        errorCategories.invalidFormats++;
      } else if (error.includes('Duplicate')) {
        errorCategories.duplicates++;
      } else if (error.includes('already exists in database')) {
        errorCategories.databaseDuplicates++;
      }
    });
  });

  const summary: ValidationSummary = {
    totalBooks: parsedData.length,
    validBooks: validBooks.length,
    invalidBooks: invalidBooks.length,
    errorCategories,
    errorsByRow: {}
  };

  // Group errors by row
  invalidBooks.forEach(book => {
    summary.errorsByRow[book.rowNumber] = book.errors;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Data Validation Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{summary.totalBooks}</div>
            <div className="text-sm text-blue-600">Total Books</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{summary.validBooks}</div>
            <div className="text-sm text-green-600">Valid Books</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{summary.invalidBooks}</div>
            <div className="text-sm text-red-600">Invalid Books</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {summary.totalBooks > 0 ? Math.round((summary.validBooks / summary.totalBooks) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>

        {/* Error Categories */}
        {summary.invalidBooks > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Error Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {errorCategories.missingFields > 0 && (
                <Badge variant="destructive" className="justify-center">
                  {errorCategories.missingFields} Missing Fields
                </Badge>
              )}
              {errorCategories.invalidFormats > 0 && (
                <Badge variant="destructive" className="justify-center">
                  {errorCategories.invalidFormats} Invalid Formats
                </Badge>
              )}
              {errorCategories.duplicates > 0 && (
                <Badge variant="destructive" className="justify-center">
                  {errorCategories.duplicates} Duplicates
                </Badge>
              )}
              {errorCategories.databaseDuplicates > 0 && (
                <Badge variant="destructive" className="justify-center">
                  {errorCategories.databaseDuplicates} DB Duplicates
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Sample Errors */}
        {summary.invalidBooks > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Sample Errors</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.entries(summary.errorsByRow).slice(0, 5).map(([rowNumber, errors]) => (
                <Alert key={rowNumber} variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Row {rowNumber}:</strong> {errors.join(', ')}
                  </AlertDescription>
                </Alert>
              ))}
              {Object.keys(summary.errorsByRow).length > 5 && (
                <p className="text-sm text-gray-500">
                  ... and {Object.keys(summary.errorsByRow).length - 5} more rows with errors
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {summary.validBooks > 0 && (
            <Button onClick={onUpload} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload {summary.validBooks} Valid Books
            </Button>
          )}
          {summary.invalidBooks > 0 && (
            <Button onClick={onExportFailed} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export {summary.invalidBooks} Failed Books
            </Button>
          )}
          <Button onClick={onCancel} variant="ghost" className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>

        {/* Warnings */}
        {summary.invalidBooks > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {summary.invalidBooks} books have validation errors and will be skipped during upload. 
              You can export them to fix the errors and re-upload.
            </AlertDescription>
          </Alert>
        )}

        {summary.validBooks === 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              No valid books found. Please check your Excel file format and data.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PreviewValidation; 