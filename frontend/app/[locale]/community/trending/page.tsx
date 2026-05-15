'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Heart, MessageCircle, Share2 } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

type TrendingItem = {
  id: string;
  title: string;
  category: string;
  engagement: number;
  momentum: 'rising' | 'stable' | 'cooling';
  comments: number;
  shares: number;
  date: string;
  description: string;
};

const mockTrending: TrendingItem[] = [
  {
    id: '1',
    title: 'Upcoming Assembly Elections 2025',
    category: 'Elections',
    engagement: 8420,
    momentum: 'rising',
    comments: 234,
    shares: 156,
    date: 'Today',
    description: 'Comprehensive coverage of assembly elections happening this year',
  },
  {
    id: '2',
    title: 'Digital Voting: The Future of Elections',
    category: 'Electoral Technology',
    engagement: 6350,
    momentum: 'rising',
    comments: 189,
    shares: 142,
    date: 'Yesterday',
    description: 'Discussion on the potential and challenges of digital voting systems',
  },
  {
    id: '3',
    title: 'Voter Registration Drive 2025',
    category: 'Voter Registration',
    engagement: 5210,
    momentum: 'stable',
    comments: 167,
    shares: 89,
    date: '2 days ago',
    description: 'Community-led voter registration initiatives across regions',
  },
  {
    id: '4',
    title: 'Election Commission Announces New Guidelines',
    category: 'Announcements',
    engagement: 4890,
    momentum: 'stable',
    comments: 145,
    shares: 124,
    date: '3 days ago',
    description: 'New directives for poll observers and election monitoring',
  },
  {
    id: '5',
    title: 'First-Time Voters: Rights and Responsibilities',
    category: 'Civic Education',
    engagement: 3760,
    momentum: 'cooling',
    comments: 98,
    shares: 67,
    date: '1 week ago',
    description: 'What young voters need to know before casting their vote',
  },
  {
    id: '6',
    title: 'Combating Electoral Misinformation',
    category: 'Media Literacy',
    engagement: 3420,
    momentum: 'cooling',
    comments: 87,
    shares: 52,
    date: '1 week ago',
    description: 'Tools and strategies to identify and report false information',
  },
];

const getMomentumColor = (momentum: string) => {
  switch (momentum) {
    case 'rising':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'stable':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'cooling':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TrendingPage() {
  const t = useTranslations();
  const [trending, setTrending] = useState<TrendingItem[]>(mockTrending);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <PageWrapper title="Trending Now">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={32} className="text-india-saffron" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Trending Now
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            What\'s capturing the community\'s attention right now
          </p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-india-saffron mx-auto"></div>
            </div>
          ) : trending.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No trending items yet.</p>
              </CardContent>
            </Card>
          ) : (
            trending.map((item, index) => (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-india-green"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-india-saffron">#{index + 1}</span>
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge className={getMomentumColor(item.momentum)}>
                          {item.momentum === 'rising' && '📈'}
                          {item.momentum === 'stable' && '→'}
                          {item.momentum === 'cooling' && '📉'}
                          {item.momentum.charAt(0).toUpperCase() + item.momentum.slice(1)}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-india-blue hover:text-india-saffron transition-colors">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-sm mt-2">
                        {item.date}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-india-saffron">
                        {(item.engagement / 1000).toFixed(1)}K
                      </div>
                      <div className="text-xs text-gray-500">engagement</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{item.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} className="text-india-green" />
                      <span>{item.comments} comments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 size={16} className="text-india-blue" />
                      <span>{item.shares} shares</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-india-saffron hover:text-india-green"
                    >
                      <Heart size={16} />
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
