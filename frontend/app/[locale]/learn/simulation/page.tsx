"use client";

import { useTranslations } from 'next-intl';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, MapPin, Users, CheckCircle, Clock } from 'lucide-react';

export default function SimulationPage() {
  const t = useTranslations();

  const scenarios = [
    {
      title: 'Voter Registration Process',
      description: 'Learn how to register as a voter',
      duration: '10 min',
      difficulty: 'Beginner',
      icon: Users,
    },
    {
      title: 'Cast Your Vote',
      description: 'Experience the actual voting process',
      duration: '8 min',
      difficulty: 'Beginner',
      icon: CheckCircle,
    },
    {
      title: 'Election Counting',
      description: 'Understand how votes are counted',
      duration: '12 min',
      difficulty: 'Intermediate',
      icon: Clock,
    },
    {
      title: 'Campaign Strategy',
      description: 'Run a mock election campaign',
      duration: '20 min',
      difficulty: 'Advanced',
      icon: Users,
    },
  ];

  return (
    <PageWrapper
      title="Polling Simulation"
      description="Experience the Indian electoral process firsthand through interactive simulations"
      breadcrumbs={[
        { label: 'Learn', href: '/learn' },
        { label: 'Simulation' },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {scenarios.map((scenario, idx) => {
          const Icon = scenario.icon;
          return (
            <Card key={idx} className="hover:shadow-civic-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <Icon className="w-5 h-5 text-saffron" />
                      {scenario.title}
                    </CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${scenario.difficulty === 'Beginner' ? 'bg-green-100 text-india-green' : scenario.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {scenario.difficulty}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">⏱️ {scenario.duration}</div>
                  <Button variant="default" size="sm">Start Simulation</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-civic-light border-saffron/20">
        <CardHeader>
          <CardTitle className="text-saffron">About Simulations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            Our interactive simulations recreate real-world electoral scenarios. Through gamified experiences, you'll learn:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-saffron font-bold">•</span>
              <span>How voter registration works and its importance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-india-green font-bold">•</span>
              <span>The step-by-step voting process in Indian elections</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-navy font-bold">•</span>
              <span>How election results are counted and announced</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-saffron font-bold">•</span>
              <span>Strategic thinking in electoral campaigns</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
