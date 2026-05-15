'use client';

import { useEffect, useState } from 'react';
import { MessageSquare, ThumbsUp, Reply } from 'lucide-react';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

type Discussion = {
  id: string;
  title: string;
  author: string;
  content: string;
  replies: number;
  likes: number;
  category: string;
  date: string;
};

const mockDiscussions: Discussion[] = [
  {
    id: '1',
    title: 'How to verify voter registration?',
    author: 'Ananya Singh',
    content: 'I want to check if my name is on the voter list. What\'s the process?',
    replies: 8,
    likes: 12,
    category: 'Voting Process',
    date: '2 days ago',
  },
  {
    id: '2',
    title: 'Understanding candidate manifestos',
    author: 'Rohan Patel',
    content: 'Can anyone explain how to analyze and compare different candidates\' promises?',
    replies: 15,
    likes: 24,
    category: 'Elections',
    date: '4 days ago',
  },
  {
    id: '3',
    title: 'Your rights during voting day',
    author: 'Maya Sharma',
    content: 'Let\'s discuss what citizens should know about their rights at polling stations.',
    replies: 5,
    likes: 18,
    category: 'Voter Rights',
    date: '1 week ago',
  },
  {
    id: '4',
    title: 'Electronic Voting Machines - How do they work?',
    author: 'Vikram Kumar',
    content: 'A thread to discuss the functioning and reliability of EVMs in Indian elections.',
    replies: 22,
    likes: 31,
    category: 'Electoral Technology',
    date: '1 week ago',
  },
  {
    id: '5',
    title: 'Local governance initiatives',
    author: 'Priya Desai',
    content: 'Share experiences with local community programs and municipal governance.',
    replies: 9,
    likes: 14,
    category: 'Local Governance',
    date: '2 weeks ago',
  },
];

export default function DiscussionsPage() {
  const t = useTranslations();
  const [discussions, setDiscussions] = useState<Discussion[]>(mockDiscussions);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <PageWrapper title="Community Discussions">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Community Discussions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Join conversations about elections, voting, and civic participation
          </p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-india-saffron mx-auto"></div>
            </div>
          ) : discussions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No discussions yet. Be the first to start one!</p>
              </CardContent>
            </Card>
          ) : (
            discussions.map((discussion) => (
              <Card
                key={discussion.id}
                className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-india-saffron"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-india-blue hover:text-india-saffron transition-colors">
                        {discussion.title}
                      </CardTitle>
                      <CardDescription className="text-sm mt-2">
                        by <span className="font-medium">{discussion.author}</span> • {discussion.date}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      {discussion.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{discussion.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MessageSquare size={16} className="text-india-green" />
                      <span>{discussion.replies} replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp size={16} className="text-india-saffron" />
                      <span>{discussion.likes} likes</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto text-india-blue hover:text-india-saffron"
                    >
                      <Reply size={16} className="mr-1" />
                      Reply
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
