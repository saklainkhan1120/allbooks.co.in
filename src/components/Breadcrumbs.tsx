'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = "" }) => {
  const pathname = usePathname();
  
  // Generate breadcrumbs based on current path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', path: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Convert segment to readable label
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        path: isLast ? undefined : currentPath,
        isCurrent: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <nav className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          
          {item.path && !item.isCurrent ? (
            <Link
              href={item.path}
              className="flex items-center hover:text-blue-600 transition-colors"
            >
              {index === 0 && <Home className="h-4 w-4 mr-1" />}
              <span className="line-clamp-1">{item.label}</span>
            </Link>
          ) : (
            <span className="flex items-center text-gray-900 font-medium">
              {index === 0 && <Home className="h-4 w-4 mr-1" />}
              <span className="line-clamp-1">{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}; 