import { db } from './database';

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

// Get all admin users
export const getAllAdmins = async () => {
  return await db.admin.getAll();
};

// Add new admin user
export const addAdmin = async (email: string, password: string) => {
  return await db.admin.create(email, password);
};

// Verify admin login
export const verifyAdminLogin = async (email: string, password: string) => {
  return await db.admin.verifyLogin(email, password);
};

// Delete admin user
export const deleteAdmin = async (adminId: string) => {
  return await db.admin.delete(adminId);
};

// Update admin email
export const updateAdminEmail = async (adminId: string, newEmail: string) => {
  return await db.admin.updateEmail(adminId, newEmail);
};

// Delete a book
export const deleteBook = async (bookId: string) => {
  return await db.bookManagement.delete(bookId);
};

// Update book status
export const updateBookStatus = async (bookId: string, status: string) => {
  return await db.bookManagement.updateStatus(bookId, status);
};

// Get today's upload count
export const getTodayUploadCount = async () => {
  return await db.bookManagement.getTodayUploadCount();
};

// Get unique authors count
export const getUniqueAuthorsCount = async () => {
  return await db.bookManagement.getUniqueAuthorsCount();
};

// Get unique categories count
export const getUniqueCategoriesCount = async () => {
  return await db.bookManagement.getUniqueCategoriesCount();
};

// Get unique publishers count
export const getUniquePublishersCount = async () => {
  return await db.bookManagement.getUniquePublishersCount();
};

// Search books with filters
export const searchBooks = async (filters: {
  search_term?: string;
  genre_filter?: string;
  author_filter?: string;
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return await db.bookManagement.search(filters);
};

// Get book by ID
export const getBookById = async (bookId: string) => {
  return await db.books.getById(bookId);
};

// Get unique genres for filters
export const getUniqueGenres = async () => {
  return await db.bookManagement.getUniqueGenres();
};

// Get unique authors for filters
export const getUniqueAuthors = async () => {
  return await db.bookManagement.getUniqueAuthors();
};

// Get unique publishers for filters
export const getUniquePublishers = async () => {
  return await db.bookManagement.getUniquePublishers();
}; 