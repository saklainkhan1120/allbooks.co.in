import { Metadata } from 'next';
import AdminDashboardPage from '@/components/AdminDashboardPage';

export const metadata: Metadata = {
  title: 'Admin Dashboard - allBooks.co.in',
  description: 'Admin dashboard for managing allBooks.co.in content and operations.',
  robots: 'noindex, nofollow',
};

export default function AdminDashboard() {
  return <AdminDashboardPage />;
} 