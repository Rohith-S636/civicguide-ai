"use client";

import { useTranslations } from 'next-intl';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, Award, Flame, BookOpen } from 'lucide-react';

export default function ProfilePage() {
  const t = useTranslations();

  const badges = [
    { name: 'Quick Learner', icon: '⚡', earned: true },
    { name: 'Quiz Master', icon: '🧠', earned: true },
    { name: 'Constitution Expert', icon: '📜', earned: false },
    { name: 'Community Champion', icon: '👑', earned: false },
    { name: 'Civic Hero', icon: '🦸', earned: false },
    { name: 'Milestone: 1000 XP', icon: '🎯', earned: true },
  ];

  const achievements = [
    {
      title: 'First Quiz',
      description: 'Completed your first quiz',
      xp: 50,
      date: '2 days ago',
    },
    {
      title: 'Weekly Streak',
      description: 'Learned for 7 consecutive days',
      xp: 500,
      date: '1 day ago',
    },
    {
      title: 'Constitution Chapter Complete',
      description: 'Finished all Constitution lessons',
      xp: 200,
      date: '5 days ago',
    },
  ];

  return (
    <PageWrapper
      title={t('profile.title')}
      description="Track your learning progress and achievements"
      breadcrumbs={[{ label: t('profile.title') }]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-saffron mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Total XP</p>
              <p className="text-3xl font-bold text-saffron">2,450</p>
              <p className="text-xs text-gray-500 mt-1">+250 this week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="w-8 h-8 text-india-green mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Current Level</p>
              <p className="text-3xl font-bold text-india-green">5</p>
              <p className="text-xs text-gray-500 mt-1">Intermediate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Learning Streak</p>
              <p className="text-3xl font-bold text-orange-600">7</p>
              <p className="text-xs text-gray-500 mt-1">days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <BookOpen className="w-8 h-8 text-navy mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Badges Earned</p>
              <p className="text-3xl font-bold text-navy">6</p>
              <p className="text-xs text-gray-500 mt-1">of 12</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Badges & Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge, idx) => (
            <Card key={idx} className={`text-center transition-all ${badge.earned ? 'bg-white' : 'bg-gray-50 opacity-60'}`}>
              <CardContent className="pt-6">
                <p className="text-4xl mb-2">{badge.icon}</p>
                <p className="text-xs font-semibold text-gray-900">{badge.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Recent Achievements</h2>
        <div className="space-y-4">
          {achievements.map((achievement, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{achievement.date}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-saffron text-white rounded-full font-semibold">+{achievement.xp} XP</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
