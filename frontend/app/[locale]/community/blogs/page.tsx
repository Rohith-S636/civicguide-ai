'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Eye, Share2 } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

type Blog = {
  id: string;
  title: string;
  author: string;
  excerpt: string;
  category: string;
  readTime: number;
  views: number;
  date: string;
  image?: string;
};

const mockBlogs: Blog[] = [
  {
    id: '1',
    title: 'Understanding India\'s Electoral System',
    author: 'Dr. Rajesh Kapoor',
    excerpt: 'A comprehensive guide to how the Indian electoral system works, from voter registration to voting day.',
    category: 'Electoral Process',
    readTime: 8,
    views: 2450,
    date: '1 week ago',
  },
  {
    id: '2',
    title: 'The Evolution of Voter Rights in India',
    author: 'Prof. Neha Sharma',
    excerpt: 'Explore the historical journey of voting rights in India and how they have expanded over the decades.',
    category: 'Voter Rights',
    readTime: 12,
    views: 1890,
    date: '2 weeks ago',
  },
  {
    id: '3',
    title: 'How to Report Electoral Violations',
    author: 'Ajay Verma',
    excerpt: 'Step-by-step guide on what constitutes an electoral violation and how to report it to authorities.',
    category: 'Civic Responsibility',
    readTime: 5,
    views: 3200,
    date: '3 weeks ago',
  },
  {
    id: '4',
    title: 'Digital Literacy and Online Misinformation',
    author: 'Meera Patel',
    excerpt: 'Learn how to identify fake news and verify information during election season.',
    category: 'Media Literacy',
    readTime: 7,
    views: 2100,
    date: '1 month ago',
  },
  {
    id: '5',
    title: 'Young Voters: Why Your Vote Matters',
    author: 'Rohan Singh',
    excerpt: 'An inspiring piece about youth participation in democracy and the impact of first-time voters.',
    category: 'Civic Engagement',
    readTime: 6,
    views: 1650,
    date: '1 month ago',
  },
  {
    id: '6',
    title: 'Local Elections: Making a Difference at Home',
    author: 'Kavya Rao',
    excerpt: 'Why local elections matter and how to get involved in your community\'s governance.',
    category: 'Local Governance',
    readTime: 9,
    views: 1420,
    date: '2 months ago',
  },
];

export default function BlogsPage() {
  const t = useTranslations();
  const [blogs, setBlogs] = useState<Blog[]>(mockBlogs);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <PageWrapper title="Civic Blog">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Civic Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Insightful articles about elections, voting, and civic participation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-india-saffron mx-auto"></div>
            </div>
          ) : blogs.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No blogs available yet.</p>
              </CardContent>
            </Card>
          ) : (
            blogs.map((blog) => (
              <Card
                key={blog.id}
                className="hover:shadow-lg transition-shadow hover:scale-105 transform cursor-pointer flex flex-col"
              >
                {blog.image && (
                  <div className="w-full h-40 bg-gradient-to-br from-india-saffron/20 to-india-green/20 flex items-center justify-center">
                    <BookOpen size={48} className="text-india-blue opacity-50" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg text-india-blue line-clamp-2">
                      {blog.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    by <span className="font-medium">{blog.author}</span> • {blog.date}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-xs">
                      {blog.category}
                    </Badge>
                    <span className="text-xs text-gray-500">{blog.readTime} min read</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 border-t pt-4">
                    <Eye size={14} className="text-india-green" />
                    <span>{blog.views.toLocaleString()} views</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-india-blue hover:text-india-saffron"
                    >
                      <Share2 size={14} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
