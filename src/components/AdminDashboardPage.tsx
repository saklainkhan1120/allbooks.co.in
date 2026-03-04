'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Tag,
  User,
  FolderOpen,
  Building,
  Clock,
  TrendingUp,
  Star,
  Lock,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  Cloud,
  X,
  AlertCircle
} from "lucide-react";
// Removed direct database import - using API routes instead
import { DealsManagement } from "./DealsManagement";
import { BestsellerManagement } from "./BestsellerManagement";
import { SearchAndAddDeals } from "./SearchAndAddDeals";
import { BulkUploadDeals } from "./BulkUploadDeals";
import PreviewValidation from "./PreviewValidation";

import { exportFailedBooksToExcel } from '@/lib/admin/fileProcessing';
import { exportBooks } from '@/lib/export';

// Types
interface DashboardStats {
  totalBooks: number;
  todayUploads: number;
  uniqueAuthors: number;
  uniqueCategories: number;
  uniquePublishers: number;
  totalDeals: number;
  topSixDeals: number;
  fixedPositionDeals: number;
}

interface Book {
  id: string;
  asin: string | null;
  title: string | null;
  author?: string | null;
  cover_image_url?: string | null;
  inr_price?: number | null;
  status: string | null;
  created_at: Date;
  publisher?: string | null;
  isbn?: string | null;
}

interface Admin {
  id: string;
  email: string;
  created_at: Date;
  password_hash?: string | null;
}

interface UploadProgress {
  processed: number;
  saved: number;
  skipped: number;
  total: number;
  currentBatch: number;
  totalBatches: number;
  status: 'idle' | 'uploading' | 'complete' | 'error';
}

interface ParsedBook {
  data: any | null;
  originalData: any;
  errors: string[];
  rowNumber: number;
}

const AdminDashboardPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { adminUser, loading, signOut } = useAdminAuth();
  
  // State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'book-catalog' | 'deals' | 'bestsellers'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    todayUploads: 0,
    uniqueAuthors: 0,
    uniqueCategories: 0,
    uniquePublishers: 0,
    totalDeals: 0,
    topSixDeals: 0,
    fixedPositionDeals: 0
  });
  const [books, setBooks] = useState<Book[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Book Catalog States
  const [fileType, setFileType] = useState<'csv' | 'excel' | null>(null);
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedBook[]>([]);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    processed: 0,
    saved: 0,
    skipped: 0,
    total: 0,
    currentBatch: 0,
    totalBatches: 0,
    status: 'idle'
  });

  // Export states
  const [exportStatus, setExportStatus] = useState('all');
  const [exportGenre, setExportGenre] = useState('');
  const [exportAuthor, setExportAuthor] = useState('');
  const [exportPublisher, setExportPublisher] = useState('');
  const [exportLimit, setExportLimit] = useState(1000);
  const [genreOptions, setGenreOptions] = useState<string[]>([]);
  const [authorOptions, setAuthorOptions] = useState<string[]>([]);
  const [publisherOptions, setPublisherOptions] = useState<string[]>([]);
  const [authorSearch, setAuthorSearch] = useState('');
  const [publisherSearch, setPublisherSearch] = useState('');

  // Additional deals states
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for deals


  // Deals Tab States



  // Load data on mount
  useEffect(() => {
    if (adminUser) {
      loadDashboardStats();
      loadBooks();
      loadAdmins();
    }
  }, [adminUser]);

  // Reload books when search term changes
  useEffect(() => {
    if (adminUser) {
      loadBooks();
    }
  }, [searchTerm, adminUser]);

  // Check authentication
  useEffect(() => {
    if (!loading && !adminUser) {
      router.push('/admin/login');
    }
  }, [loading, adminUser, router]);

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load dashboard stats');
      }

      const stats = data.stats;
      setStats({
        totalBooks: stats.totalBooks,
        todayUploads: stats.todayUploads,
        uniqueAuthors: stats.uniqueAuthors,
        uniqueCategories: stats.uniqueCategories,
        uniquePublishers: stats.uniquePublishers,
        totalDeals: stats.totalDeals,
        topSixDeals: stats.topSixDeals,
        fixedPositionDeals: stats.fixedPositionDeals
      });

      // Load options for export filters (we'll need to create separate API for these)
      // For now, we'll set empty arrays and load them separately if needed
      setGenreOptions([]);
      setAuthorOptions([]);
      setPublisherOptions([]);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    }
  };

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/books?search=${encodeURIComponent(searchTerm.trim())}&page=1&limit=50`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load books');
      }

      setBooks(data.books || []);
    } catch (error) {
      console.error('Error loading books:', error);
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const response = await fetch('/api/admin/admins');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load admins');
      }

      setAdmins(data.admins || []);
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail || !newAdminPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAddingAdmin(true);
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newAdminEmail,
          password: newAdminPassword
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to add admin');
      }

      toast({
        title: "Success",
        description: "Admin added successfully",
      });

      setNewAdminEmail('');
      setNewAdminPassword('');
      loadAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({
        title: "Error",
        description: "Failed to add admin",
        variant: "destructive"
      });
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    try {
      const response = await fetch(`/api/admin/admins?id=${adminId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete admin');
      }

      toast({
        title: "Success",
        description: "Admin deleted successfully",
      });

      loadAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast({
        title: "Error",
        description: "Failed to delete admin",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      const response = await fetch(`/api/admin/books?id=${bookId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete book');
      }

      toast({
        title: "Success",
        description: "Book deleted successfully",
      });

      loadBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (bookId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/books?id=${bookId}&status=${newStatus}`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update book status');
      }

      toast({
        title: "Success",
        description: "Book status updated successfully",
      });

      loadBooks();
    } catch (error) {
      console.error('Error updating book status:', error);
      toast({
        title: "Error",
        description: "Failed to update book status",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    try {
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        setFileType('excel');
        
        // Import the file processing functions
        const { handleExcelFile } = await import('@/lib/admin/fileProcessing');
        
        const result = await handleExcelFile(file);
        setExcelSheets(result.sheetNames);
        setSelectedSheet(result.sheetNames[0]);
        
        if (result.sheetNames.length > 0) {
          const sheetResult = await result.processSheet(result.sheetNames[0]);
          setCsvPreview(sheetResult.preview);
          setParsedData(sheetResult.transformedData);
          setShowPreview(true);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    }
  };

  const downloadTemplate = async (format: 'excel' | 'csv') => {
    try {
      const { downloadTemplate: downloadTemplateFn } = await import('@/lib/admin/fileProcessing');
      downloadTemplateFn(format);
      toast({
        title: "Template Downloaded",
        description: `${format.toUpperCase()} template downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download template",
        variant: "destructive"
      });
    }
  };

  const generateBookLink = (book: { title: string; author?: string; isbn?: string; asin: string }) => {
    const slug = book.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `/book/${slug}/${book.asin}`;
  };

  const handleUploadConfirmAction = async (resumeFromProgress = false) => {
    setIsUploading(true);
    
    try {
      const { handleUploadConfirm } = await import('@/lib/admin/bulkUpload');
      
      await handleUploadConfirm(
        parsedData,
        resumeFromProgress,
        undefined, // resumeData - implement if needed
        (progress) => {
          setUploadProgress(progress);
        },
        (results) => {
          toast({
            title: "Upload Complete",
            description: `${results.successCount} books uploaded successfully. ${results.errorCount} errors.`,
          });
          // Refresh dashboard stats after upload
          loadDashboardStats();
          loadBooks();
        }
      );
      
      setShowPreview(false);
      setCsvPreview([]);
      setParsedData([]);
      setFileType(null);
      setFileInputKey(prev => prev + 1);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Upload was interrupted",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress({
          processed: 0,
          saved: 0,
          skipped: 0,
          total: 0,
          currentBatch: 0,
          totalBatches: 0,
          status: 'idle'
        });
      }, 3000);
    }
  };

  const handleExportFailedBooks = async () => {
    try {
      const failedBooks = parsedData.filter(book => book.errors.length > 0);
      
      if (failedBooks.length === 0) {
        toast({
          title: "No Failed Books",
          description: "There are no failed books to export.",
        });
        return;
      }

      // Get original headers from the first row of preview data
      const originalHeaders = csvPreview.length > 0 ? Object.keys(csvPreview[0]) : [];
      
      const { exportFailedBooksToExcel } = await import('@/lib/admin/fileProcessing');
      exportFailedBooksToExcel(failedBooks, originalHeaders, 'failed_books');
      
      toast({
        title: "Export Complete",
        description: `${failedBooks.length} failed books exported successfully`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export failed books",
        variant: "destructive"
      });
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setParsedData([]);
    setFileType(null);
    setFileInputKey(prev => prev + 1);
  };

  const handleSheetSelect = async (sheetName: string) => {
    if (!fileType || fileType !== 'excel') return;
    
    try {
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      if (!file) return;
      
      const { handleExcelFile } = await import('@/lib/admin/fileProcessing');
      const result = await handleExcelFile(file);
      const sheetResult = await result.processSheet(sheetName);
      setCsvPreview(sheetResult.preview);
      setParsedData(sheetResult.transformedData);
      setShowPreview(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process sheet",
        variant: "destructive"
      });
    }
  };

  const handleExportBooks = async (format: 'csv' | 'excel' = 'excel') => {
    try {
      console.log('Starting export with filters:', { exportStatus, exportGenre, exportAuthor, exportPublisher, exportLimit });
      
      const count = await exportBooks({
        status: exportStatus,
        genre: exportGenre,
        author: exportAuthor,
        publisher: exportPublisher,
        limit: exportLimit
      }, format);
      
      toast({
        title: "Export Complete",
        description: `${count} books exported successfully.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export books",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/admin/login');
  };

  const handleRefresh = () => {
    if (adminUser) {
      loadDashboardStats();
      loadBooks();
      loadAdmins();
      // Force refresh of deals by incrementing refresh key
      setRefreshKey(prev => prev + 1);
    }
  };








  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900 shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Panel</h1>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveTab('book-catalog')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'book-catalog'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <BookOpen className="mr-3 h-5 w-5" />
              Book Catalog
            </button>
            
            <button
              onClick={() => setActiveTab('deals')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'deals'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Tag className="mr-3 h-5 w-5" />
              Daily Deals
            </button>
            
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'bestsellers'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <TrendingUp className="mr-3 h-5 w-5" />
              Bestsellers
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900 hover:text-white rounded-md transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <main className="p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                <Button onClick={loadDashboardStats} variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">Total Books</CardTitle>
                    <BookOpen className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalBooks.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">Today&apos;s Uploads</CardTitle>
                    <Clock className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.todayUploads}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">Unique Authors</CardTitle>
                    <User className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.uniqueAuthors}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">Categories</CardTitle>
                    <FolderOpen className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.uniqueCategories}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">Publishers</CardTitle>
                    <Building className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.uniquePublishers}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">Total Deals</CardTitle>
                    <Tag className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalDeals}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">Top 6 Deals</CardTitle>
                    <Star className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.topSixDeals}</div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">Fixed Position</CardTitle>
                    <Lock className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.fixedPositionDeals}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Admin Management */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Admin Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="admin-email" className="text-gray-900">Email</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="admin@example.com"
                        className="border border-gray-300 text-gray-900 bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-password" className="text-gray-900">Password</Label>
                      <Input
                        id="admin-password"
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Password"
                        className="border border-gray-300 text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddAdmin} disabled={isAddingAdmin}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Admin
                  </Button>

                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Current Admins</h3>
                    <div className="space-y-2">
                      {admins.map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <span className="text-sm text-gray-900">{admin.email}</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteAdmin(admin.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Book Catalog Tab */}
          {activeTab === 'book-catalog' && (
            <div className="space-y-6">
              <Tabs defaultValue="upload" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
                  <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-gray-100">
                    <Upload className="h-4 w-4" />
                    Bulk Upload
                  </TabsTrigger>
                  <TabsTrigger value="manage" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-gray-100">
                    <Search className="h-4 w-4" />
                    Manage Books
                  </TabsTrigger>
                  <TabsTrigger value="add" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-gray-100">
                    <Plus className="h-4 w-4" />
                    Add Single Book
                  </TabsTrigger>
                </TabsList>

                {/* Bulk Upload Tab */}
                <TabsContent value="upload">
                  <div className="space-y-6">
                    {/* Main Upload Card */}
                    <Card className="bg-white border border-gray-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                          <Upload className="h-5 w-5" />
                          Bulk Upload Books
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Alert className="bg-blue-50 border-blue-200">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            Upload an Excel (.xlsx) or CSV file with book data. Excel is recommended for complex data with commas and quotes.
                            Only title, main_genre, and asin are required fields. Use semicolons (;) to separate multiple values in array fields.
                          </AlertDescription>
                        </Alert>

                        {/* Template Downloads */}
                        <div className="flex gap-3">
                          <Button onClick={() => downloadTemplate('excel')} variant="outline" className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50">
                            <FileSpreadsheet className="h-4 w-4" />
                            Download Excel Template
                          </Button>
                        </div>
                        
                        {/* Modern File Upload Area */}
                        <div className="relative">
                          <div className="border-2 border-gray-300 border-dashed rounded-xl p-12 text-center hover:border-gray-400 transition-colors bg-gray-50">
                            <div className="flex flex-col items-center gap-6">
                              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                                <Cloud className="h-10 w-10 text-blue-500" />
                              </div>
                              <div className="space-y-2">
                                <p className="text-xl font-medium text-blue-600">Choose file</p>
                                <p className="text-sm text-gray-500">
                                  {fileType ? `Selected: ${fileType.toUpperCase()} file` : "No file chosen"}
                                </p>
                              </div>
                              <Input
                                key={fileInputKey}
                                id="file-upload"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>
                          
                          {/* Clear Button */}
                          {fileType && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setFileInputKey(prev => prev + 1);
                                setFileType(null);
                                setCsvPreview([]);
                                setParsedData([]);
                                setShowPreview(false);
                              }}
                              aria-label="Clear file"
                              className="absolute top-3 right-3 h-8 w-8 bg-white border border-gray-200 hover:bg-gray-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        {/* Excel Sheet Selection */}
                        {fileType === 'excel' && excelSheets.length > 1 && !showPreview && (
                          <Card className="bg-blue-50 border border-blue-200">
                            <CardContent className="pt-6">
                              <Label className="text-sm font-medium text-blue-700">Select Excel Sheet</Label>
                              <select 
                                value={selectedSheet}
                                onChange={(e) => {
                                  setSelectedSheet(e.target.value);
                                  handleSheetSelect(e.target.value);
                                }}
                                className="w-full p-3 border border-gray-300 rounded-lg mt-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                              >
                                {excelSheets.map((sheet) => (
                                  <option key={sheet} value={sheet}>{sheet}</option>
                                ))}
                              </select>
                            </CardContent>
                          </Card>
                        )}
                      </CardContent>
                    </Card>

                    {/* Preview Section */}
                    {showPreview && (
                      <PreviewValidation
                        parsedData={parsedData}
                        onUpload={() => handleUploadConfirmAction()}
                        onExportFailed={handleExportFailedBooks}
                        onCancel={handleCancelPreview}
                      />
                    )}

                    {/* Progress Section */}
                    {uploadProgress.status === 'uploading' && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            Upload Progress
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                              <span>Processing batch {uploadProgress.currentBatch} of {uploadProgress.totalBatches}</span>
                              <span>{uploadProgress.processed} of {uploadProgress.total} books processed</span>
                            </div>
                            
                            {/* Three Progress Bars */}
                            <div className="space-y-3">
                              {/* Processed Books (Blue) */}
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-blue-600 font-medium">Processed</span>
                                  <span className="text-blue-600">{uploadProgress.processed} books</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(uploadProgress.processed / uploadProgress.total) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              {/* Saved Books (Green) */}
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-green-600 font-medium">Saved</span>
                                  <span className="text-green-600">{uploadProgress.saved} books</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(uploadProgress.saved / uploadProgress.total) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              {/* Skipped Books (Gray) */}
                              <div>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-600 font-medium">Skipped</span>
                                  <span className="text-gray-600">{uploadProgress.skipped} books</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(uploadProgress.skipped / uploadProgress.total) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              {uploadProgress.saved} books saved to database successfully
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Manage Books Tab */}
                <TabsContent value="manage">
                  <Card className="bg-white border border-gray-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                          <Search className="h-5 w-5" />
                          Manage Existing Books
                        </CardTitle>
                        <Button onClick={loadBooks} variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <Input
                          placeholder="Search by title, author, or ASIN..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full max-w-md border border-gray-300 text-gray-900 bg-white"
                        />
                      </div>

                      <div className="space-y-3 max-w-6xl">
                        {books.map((book) => (
                          <div key={book.id} className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                            {/* Book Cover */}
                            <img
                              src={book.cover_image_url || "/placeholder.svg"}
                              alt={book.title || "Book cover"}
                              className="w-12 h-16 object-cover rounded shadow-sm flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />
                            
                            {/* Book Info */}
                            <div className="flex-1 min-w-0 max-w-md">
                              <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">{book.title}</h3>
                              <p className="text-gray-600 text-xs mt-1 truncate">{book.author || book.publisher}</p>
                            </div>
                            
                            {/* ASIN */}
                            <div className="text-xs text-gray-500 font-mono min-w-0 max-w-24">
                              <span className="truncate block">{book.asin}</span>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="flex-shrink-0">
                              <Badge 
                                variant={book.status === 'active' ? 'default' : 'secondary'}
                                className={book.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                              >
                                {book.status === 'active' ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(generateBookLink({ 
                                  title: book.title || "", 
                                  author: book.author || undefined, 
                                  isbn: book.isbn || undefined, 
                                  asin: book.asin || "" 
                                }))}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => router.push(`/admin/book/edit/${book.id}`)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteBook(book.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {isLoading && (
                          <div className="text-center py-8">
                            <div className="flex items-center justify-center gap-2 text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                              <p>Loading books...</p>
                            </div>
                          </div>
                        )}
                        
                        {books.length === 0 && !isLoading && (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No books found</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Add Single Book Tab */}
                <TabsContent value="add">
                  <div className="space-y-6">
                    {/* Main Form Card */}
                    <Card className="bg-white border border-gray-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                          <Plus className="h-5 w-5" />
                          Add Single Book
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Alert className="bg-blue-50 border-blue-200">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            Add a single book to your catalog. You can use the full form for detailed data entry or download a template for bulk operations.
                          </AlertDescription>
                        </Alert>

                        {/* Quick Add Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Plus className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">Quick Add</h3>
                                <p className="text-sm text-gray-600">Add a single book with essential details</p>
                              </div>
                            </div>
                            <Button 
                              onClick={() => router.push('/admin/book/add')}
                              className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="h-4 w-4" />
                              Open Full Form
                            </Button>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">Template Method</h3>
                                <p className="text-sm text-gray-600">Use templates for consistent data entry</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => downloadTemplate('excel')} 
                                variant="outline" 
                                className="flex items-center gap-2 flex-1"
                              >
                                <FileSpreadsheet className="h-4 w-4" />
                                Excel
                              </Button>
                              <Button 
                                onClick={() => downloadTemplate('csv')} 
                                variant="outline" 
                                className="flex items-center gap-2 flex-1"
                              >
                                <Download className="h-4 w-4" />
                                CSV
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Instructions */}
                        <Card className="bg-blue-50 border border-blue-200">
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <h4 className="font-medium text-blue-900">Instructions</h4>
                              <div className="space-y-2 text-sm text-blue-800">
                                <div className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <p>Use the <strong>Full Form</strong> for adding books with complete details and validation</p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <p>Download <strong>templates</strong> to prepare data offline and upload via bulk upload</p>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <p>Required fields: <strong>Title</strong>, <strong>Main Genre</strong>, and <strong>ASIN</strong></p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CardContent>
                    </Card>

                    {/* Recent Additions */}
                    <Card className="bg-white border border-gray-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                          <Clock className="h-5 w-5" />
                          Recent Additions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-sm">No recent book additions to display</p>
                          <p className="text-xs text-gray-400 mt-1">Books you add will appear here</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Export Books Section */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Download className="h-5 w-5" />
                      Export Books
                    </CardTitle>
                    <Button onClick={handleRefresh} variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Export your book catalog with custom filters. Choose the format and filters to download your data.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="export-status" className="text-sm font-medium text-gray-700">Status</Label>
                      <select 
                        id="export-status"
                        value={exportStatus} 
                        onChange={e => setExportStatus(e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="all">All Books</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="export-genre" className="text-sm font-medium text-gray-700">Genre</Label>
                      <select 
                        id="export-genre"
                        value={exportGenre} 
                        onChange={e => setExportGenre(e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      >
                        <option value="">All Genres</option>
                        {genreOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="export-author" className="text-sm font-medium text-gray-700">Author</Label>
                      <Input
                        id="export-author"
                        list="author-list"
                        value={exportAuthor}
                        onChange={e => {
                          setExportAuthor(e.target.value);
                          setAuthorSearch(e.target.value);
                        }}
                        placeholder="Search by author..."
                        className="w-full p-3 border border-gray-300 text-gray-900 bg-white"
                      />
                      <datalist id="author-list">
                        {authorOptions.map(a => <option key={a} value={a} />)}
                      </datalist>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="export-publisher" className="text-sm font-medium text-gray-700">Publisher</Label>
                      <Input
                        id="export-publisher"
                        list="publisher-list"
                        value={exportPublisher}
                        onChange={e => {
                          setExportPublisher(e.target.value);
                          setPublisherSearch(e.target.value);
                        }}
                        placeholder="Search by publisher..."
                        className="w-full p-3 border border-gray-300 text-gray-900 bg-white"
                      />
                      <datalist id="publisher-list">
                        {publisherOptions.map(p => <option key={p} value={p} />)}
                      </datalist>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="export-limit" className="text-sm font-medium text-gray-700">Number of Books</Label>
                      <Input
                        id="export-limit"
                        type="number" 
                        min={1} 
                        max={10000} 
                        value={exportLimit} 
                        onChange={e => setExportLimit(Number(e.target.value))} 
                        className="w-full p-3 border border-gray-300 text-gray-900 bg-white"
                        placeholder="1000"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleExportBooks('excel')} 
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                      <FileSpreadsheet className="h-5 w-5" />
                      Export as Excel
                    </Button>
                    <Button 
                      onClick={() => handleExportBooks('csv')} 
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                    >
                      <Download className="h-5 w-5" />
                      Export as CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

                      {/* Deals Tab */}
            {activeTab === 'deals' && (
              <div className="space-y-6">
                <Tabs defaultValue="manage" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200">
                    <TabsTrigger value="manage" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-gray-100">
                      <Star className="h-4 w-4" />
                      Manage Deals
                    </TabsTrigger>
                    <TabsTrigger value="search" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-gray-100">
                      <Search className="h-4 w-4" />
                      Search & Add
                    </TabsTrigger>
                    <TabsTrigger value="bulk" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-700 data-[state=inactive]:hover:bg-gray-100">
                      <Upload className="h-4 w-4" />
                      Bulk Upload
                    </TabsTrigger>
                  </TabsList>

                  {/* Manage Deals Tab */}
                  <TabsContent value="manage">
                    <DealsManagement key={refreshKey} />
                  </TabsContent>

                  {/* Search & Add Tab */}
                  <TabsContent value="search">
                    <SearchAndAddDeals onDealAdded={handleRefresh} />
                  </TabsContent>

                  {/* Bulk Upload Tab */}
                  <TabsContent value="bulk">
                    <BulkUploadDeals onDealsAdded={handleRefresh} />
                  </TabsContent>
                </Tabs>
              </div>
            )}

          {/* Bestsellers Tab */}
          {activeTab === 'bestsellers' && (
            <BestsellerManagement />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 