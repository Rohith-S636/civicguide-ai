'use client';

import { useTranslations } from 'next-intl';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Newspaper, Users, MessageCircle, TrendingUp } from 'lucide-react';

export default function CommunityPage() {
  const t = useTranslations();

  const sections = [
    {
      icon: Newspaper,
      title: 'Election News',
      description: 'Latest updates from the Election Commission of India',
      count: '45 new articles',
      href: '/community/news',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      icon: Users,
      title: 'Discussions',
      description: 'Join community discussions on civic topics',
      count: '1,200+ members',
      href: '/community/discussions',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      icon: MessageCircle,
      title: 'Educational Blogs',
      description: 'Expert-written guides and analysis',
      count: '80 published',
      href: '/community/blogs',
      color: 'bg-green-100 text-green-700',
    },
    {
      icon: TrendingUp,
      title: 'Trending Topics',
      description: 'What the community is discussing today',
      count: 'Real-time',
      href: '/community/trending',
      color: 'bg-red-100 text-red-700',
    },
  ];

  return (
    <PageWrapper
      title={t('community.title')}
      description="Stay informed and engage with the civic education community"
      breadcrumbs={[{ label: t('community.title') }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          return (
            <Card key={idx} className="hover:shadow-civic-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${section.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {section.count}
                  </span>
                </div>
                <CardTitle className="mt-4">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="secondary"
                  className="w-full"
                  asChild
                >
                  <a href={section.href}>Explore</a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Featured Content */}
      <div className="bg-gradient-civic-light border border-saffron/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Featured Discussion</h2>
        <p className="text-gray-700 mb-4">
          "Understanding the Electoral Bonds System: Transparency vs. Confidentiality" - An in-depth analysis of the recent electoral reforms and their implications for Indian democracy.
        </p>
        <Button
          variant="default"
          asChild
        >
          <a href="/community/discussions/featured">Read Full Discussion</a>
        </Button>
      </div>
    </PageWrapper>
  );
}
