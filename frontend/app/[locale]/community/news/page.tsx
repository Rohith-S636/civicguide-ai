'use client';

import { useEffect, useState } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { mockNews } from '@/lib/mockData';

type NewsItem = {
  id?: string;
  title?: string;
  headline?: string;
  description?: string;
  excerpt?: string;
  date?: string;
  published_at?: string;
  source?: string;
  url?: string;
};

type LatestNewsResponse = {
  articles?: NewsItem[];
  data?: NewsItem[];
};

const formatDate = (value?: string) => {
  if (!value) return 'Recently';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
};

export default function CommunityNewsPage() {
  const [items, setItems] = useState<NewsItem[]>(
    mockNews.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      date: item.date,
      source: item.source,
    }))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadLatestNews = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const response = await api.news.getLatest(12);
        const payload = response?.data as LatestNewsResponse;
        const fromApi = (payload?.articles ?? payload?.data ?? []) as NewsItem[];
        if (isMounted && fromApi.length > 0) {
          setItems(fromApi);
        }
      } catch {
        if (isMounted) {
          setIsError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLatestNews();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageWrapper
      title="Election News"
      description="Latest election and civic updates from trusted sources"
      breadcrumbs={[
        { label: 'Community', href: '/community' },
        { label: 'Election News' },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((item, idx) => {
          const title = item.title ?? item.headline ?? 'Untitled update';
          const description = item.description ?? item.excerpt ?? 'No summary available.';
          const date = formatDate(item.published_at ?? item.date);
          const source = item.source ?? 'CivicGuide';
          const href = item.url;

          return (
            <Card key={item.id ?? `${title}-${idx}`} className="hover:shadow-civic-lg transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-md bg-amber-100 text-amber-700">
                    <Newspaper className="w-5 h-5" />
                  </div>
                  <Badge variant="default">{source}</Badge>
                </div>
                <CardTitle className="mt-3 line-clamp-2">{title}</CardTitle>
                <CardDescription>{date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 line-clamp-3">{description}</p>
                {href ? (
                  <Button asChild className="mt-4 w-full gap-2">
                    <Link href={href} target="_blank" rel="noopener noreferrer">
                      Read Article
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isLoading ? <p className="mt-6 text-sm text-gray-600">Loading latest news...</p> : null}
      {isError ? (
        <p className="mt-6 text-sm text-amber-700">
          Could not fetch live news right now. Showing offline sample items.
        </p>
      ) : null}
    </PageWrapper>
  );
}
