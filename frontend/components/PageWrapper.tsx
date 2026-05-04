'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageWrapperProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  showBreadcrumbs?: boolean;
}

export function PageWrapper({
  title,
  description,
  breadcrumbs = [],
  children,
  headerAction,
  showBreadcrumbs = true,
}: PageWrapperProps) {
  const defaultBreadcrumbs: Breadcrumb[] = [{ label: 'Home', href: '/' }, ...breadcrumbs, { label: title }];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-civic-light border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showBreadcrumbs && (
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1 text-sm">
                <li>
                  <Link href="/" className="flex items-center text-gray-600 hover:text-saffron transition-colors" aria-label="Home">
                    <Home className="w-4 h-4" />
                  </Link>
                </li>
                {defaultBreadcrumbs.slice(1).map((crumb) => (
                  <li key={crumb.label} className="flex items-center gap-1">
                    <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    {crumb.href ? (
                      <Link href={crumb.href} className="text-gray-600 hover:text-saffron transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-900 font-medium" aria-current="page">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-bold bg-gradient-civic bg-clip-text text-transparent mb-2 break-words">
                {title}
              </h1>
              {description && <p className="text-lg text-gray-600 break-words">{description}</p>}
            </div>
            {headerAction && <div className="flex-shrink-0 pt-2">{headerAction}</div>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">{children}</div>
    </div>
  );
}

export default PageWrapper;
