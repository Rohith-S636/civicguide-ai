"use client";

import { useTranslations } from 'next-intl';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Lightbulb, Zap, Target, BookMarked } from 'lucide-react';

export default function LearnPage() {
  const t = useTranslations();

  const courses = [
    {
      icon: Zap,
      title: 'Quick Quiz',
      description: 'Test your knowledge with 5-minute quizzes',
      difficulty: 'Varies',
      href: '/learn/quiz',
      color: 'bg-orange-100 text-saffron',
    },
    {
      icon: BookMarked,
      title: 'Constitution Explorer',
      description: 'Learn about Indian Constitutional provisions',
      difficulty: 'Beginner to Advanced',
      href: '/learn/constitution',
      color: 'bg-green-100 text-india-green',
    },
    {
      icon: Target,
      title: 'Polling Simulation',
      description: 'Experience the voting process interactively',
      difficulty: 'All Levels',
      href: '/learn/simulation',
      color: 'bg-blue-100 text-navy',
    },
    {
      icon: Lightbulb,
      title: 'Flashcards',
      description: 'Quick fact learning with interactive cards',
      difficulty: 'All Levels',
      href: '/learn/flashcards',
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <PageWrapper
      title={t('learn.title')}
      description="Choose your learning path to master Indian elections and civic engagement"
      breadcrumbs={[{ label: t('learn.title') }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {courses.map((course, idx) => {
          const Icon = course.icon;
          return (
            <Card key={idx} className="hover:shadow-civic-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${course.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {course.difficulty}
                  </span>
                </div>
                <CardTitle className="mt-4">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="default"
                  className="w-full"
                  asChild
                >
                  <a href={course.href}>Start Learning</a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Learning Path</CardTitle>
          <CardDescription>Recommended order to master civic knowledge</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-saffron text-white rounded-full mr-3 flex-shrink-0 font-semibold">1</span>
              <span>Start with Constitution Explorer to understand the basics</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-india-green text-white rounded-full mr-3 flex-shrink-0 font-semibold">2</span>
              <span>Use Flashcards to reinforce key concepts</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-navy text-white rounded-full mr-3 flex-shrink-0 font-semibold">3</span>
              <span>Try the Polling Simulation for hands-on experience</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full mr-3 flex-shrink-0 font-semibold">4</span>
              <span>Test yourself with Quick Quizzes</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
