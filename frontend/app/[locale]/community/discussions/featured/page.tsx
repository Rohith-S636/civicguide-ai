'use client';

import { useEffect, useState } from 'react';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type FeaturedDiscussion = {
  id: string;
  title: string;
  author: string;
  content: string;
  replies: number;
  likes: number;
  category: string;
  date: string;
  isFeatured: boolean;
  reason?: string;
};

const mockFeaturedDiscussions: FeaturedDiscussion[] = [
  {
    id: '1',
    title: 'How to verify voter registration?',
    author: 'Ananya Singh',
    content: 'I want to check if my name is on the voter list. What\'s the process? This discussion has been viewed by over 5000 people.',
    replies: 127,
    likes: 456,
    category: 'Voting Process',
    date: '2 days ago',
    isFeatured: true,
    reason: 'Most helpful discussion',
  },
  {
    id: '2',
    title: 'Understanding candidate manifestos',
    author: 'Rohan Patel',
    content: 'Can anyone explain how to analyze and compare different candidates\' promises? A comprehensive thread with expert inputs.',
    replies: 156,
    likes: 389,
    category: 'Elections',
    date: '4 days ago',
    isFeatured: true,
    reason: 'Community choice',
  },
  {
    id: '3',
    title: 'Your rights during voting day',
    author: 'Maya Sharma',
    content: 'Let\'s discuss what citizens should know about their rights at polling stations. Essential information for all voters.',
    replies: 98,
    likes: 267,
    category: 'Voter Rights',
    date: '1 week ago',
    isFeatured: true,
    reason: 'Most relevant',
  },
  {
    id: '4',
    title: 'Electronic Voting Machines - How do they work?',
    author: 'Vikram Kumar',
    content: 'A thread to discuss the functioning and reliability of EVMs in Indian elections with technical experts.',
    replies: 203,
    likes: 512,
    category: 'Electoral Technology',
    date: '1 week ago',
    isFeatured: true,
    reason: 'Editor\'s pick',
  },
];

export default function FeaturedDiscussionsPage() {
  const t = useTranslations();
  const [discussions, setDiscussions] = useState<FeaturedDiscussion[]>(mockFeaturedDiscussions);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <PageWrapper title="Featured Discussions">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Star size={32} className="text-india-saffron" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Featured Discussions
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Curated conversations on important civic topics
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          <Link href="/community/discussions">
            <Button variant="outline" className="text-india-blue hover:text-india-saffron">
              ← Back to All Discussions
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-india-saffron mx-auto"></div>
            </div>
          ) : discussions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No featured discussions yet.</p>
              </CardContent>
            </Card>
          ) : (
            discussions.map((discussion) => (
              <Card
                key={discussion.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-india-saffron relative overflow-hidden"
              >
                {discussion.isFeatured && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-india-saffron text-white px-3 py-1 rounded-full text-xs font-semibold">
                    <Star size={12} fill="white" />
                    Featured
                  </div>
                )}
                <CardHeader className="pr-32">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-india-blue hover:text-india-saffron transition-colors">
                        {discussion.title}
                      </CardTitle>
                      <CardDescription className="text-sm mt-2">
                        by <span className="font-medium">{discussion.author}</span> • {discussion.date}
                      </CardDescription>
                    </div>
                  </div>
                  {discussion.reason && (
                    <Badge className="mt-2 w-fit bg-india-green/20 text-india-green border-india-green">
                      ✓ {discussion.reason}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{discussion.content}</p>
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-india-blue">{discussion.replies}</div>
                      <div className="text-xs text-gray-600">Replies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-india-saffron">{discussion.likes}</div>
                      <div className="text-xs text-gray-600">Likes</div>
                    </div>
                    <div className="text-center">
                      <Badge variant="outline">{discussion.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      className="flex-1 bg-india-blue hover:bg-india-blue/90 text-white"
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Join Discussion
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <ThumbsUp size={16} className="mr-2" />
                      Like
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
