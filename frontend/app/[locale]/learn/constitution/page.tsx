"use client";

import { useTranslations } from 'next-intl';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, PlayCircle, Download } from 'lucide-react';

export default function ConstitutionPage() {
  const t = useTranslations();

  const chapters = [
    {
      number: 'I',
      title: 'Union and its Territory',
      articles: '1-4',
      completed: true,
    },
    {
      number: 'II',
      title: 'Citizenship',
      articles: '5-11',
      completed: true,
    },
    {
      number: 'III',
      title: 'Fundamental Rights',
      articles: '12-35',
      completed: false,
    },
    {
      number: 'IV',
      title: 'Directive Principles of State Policy',
      articles: '36-51',
      completed: false,
    },
    {
      number: 'V',
      title: 'Union',
      articles: '52-151',
      completed: false,
    },
    {
      number: 'VI',
      title: 'The States',
      articles: '152-237',
      completed: false,
    },
  ];

  return (
    <PageWrapper
      title="Constitution Explorer"
      description="Learn about the Indian Constitution chapter by chapter"
      breadcrumbs={[
        { label: 'Learn', href: '/learn' },
        { label: 'Constitution' },
      ]}
    >
      <div className="space-y-6">
        {chapters.map((chapter, idx) => (
          <Card key={idx} className="hover:shadow-civic-md transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-saffron rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {chapter.number}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{chapter.title}</CardTitle>
                    <CardDescription>Articles {chapter.articles}</CardDescription>
                  </div>
                </div>
                {chapter.completed && (
                  <span className="bg-green-100 text-india-green px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ Completed
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Read
                </Button>
                <Button variant="secondary" size="sm" className="gap-2">
                  <PlayCircle className="w-4 h-4" />
                  Watch Video
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageWrapper>
  );
}
