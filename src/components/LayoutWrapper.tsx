'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminPage && <Header />}
      <main className="flex-grow">
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
} 