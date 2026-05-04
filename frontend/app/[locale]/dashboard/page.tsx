"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Brain,
  Zap,
  BarChart3,
  BookOpen,
  FileText,
  ChevronRight,
  Calendar,
  Bell,
  ExternalLink,
  MapPin,
  Clock,
  TrendingUp,
  CheckCircle,
  Users,
  Heart,
  Scale,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const mockElections = [
  { state: 'Maharashtra', type: 'Legislative Assembly', date: '2026-05-13', daysLeft: 10 },
  { state: 'Jharkhand', type: 'Legislative Assembly', date: '2026-05-20', daysLeft: 17 },
  { state: 'Haryana', type: 'Legislative Assembly', date: '2026-06-01', daysLeft: 29 },
  { state: 'Uttarakhand', type: 'Local Body', date: '2026-06-15', daysLeft: 43 },
  { state: 'Punjab', type: 'Local Body', date: '2026-07-10', daysLeft: 68 },
];

const mockNews = [
  {
    id: 1,
    headline: 'Election Commission Releases Voter Education Campaign 2026',
    date: 'May 1, 2026',
    category: 'Announcement',
    excerpt: 'ECI launches comprehensive voter awareness drive covering 500+ districts.',
    image: '📢',
  },
  {
    id: 2,
    headline: 'New Electoral Bonds Framework Takes Effect',
    date: 'April 28, 2026',
    category: 'Update',
    excerpt: 'Transparent electoral bonds system now operational across all constituencies.',
    image: '📋',
  },
  {
    id: 3,
    headline: 'Voter Registration Drive: 5 Million New Registrations',
    date: 'April 25, 2026',
    category: 'Result',
    excerpt: 'Highest single-month voter registrations in the history of Indian elections.',
    image: '🗳️',
  },
];

const mockNotifications = [
  {
    id: 1,
    type: 'Announcement',
    title: 'New Voter ID Requirements',
    message: 'Updated list of valid voter ID documents released',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'Deadline',
    title: 'Registration Deadline',
    message: 'Last date to register as a voter: May 20, 2026',
    time: '5 hours ago',
  },
  {
    id: 3,
    type: 'Update',
    title: 'Election Schedule Released',
    message: 'Complete 2026 election schedule published on ECI website',
    time: '1 day ago',
  },
];

const whyElectionsMatter = [
  {
    icon: Heart,
    title: 'Right to Vote',
    description: 'Your vote is your voice. In a democracy, every citizen has the fundamental right to participate in elections.',
    color: 'from-red-100 to-pink-100',
    iconColor: 'text-red-600',
  },
  {
    icon: Users,
    title: 'Your Voice Counts',
    description: 'Elections are how we collectively decide our future. Every vote contributes to shaping national policies.',
    color: 'from-orange-100 to-amber-100',
    iconColor: 'text-orange-600',
  },
  {
    icon: Scale,
    title: 'Democracy Basics',
    description: 'Free and fair elections are the cornerstone of democracy. They ensure accountability and representation.',
    color: 'from-green-100 to-teal-100',
    iconColor: 'text-green-600',
  },
  {
    icon: CheckCircle,
    title: 'Civic Duty',
    description: 'Voting is not just a right but also a responsibility. Active participation strengthens democratic institutions.',
    color: 'from-blue-100 to-indigo-100',
    iconColor: 'text-blue-600',
  },
];

const quickAccessFeatures = [
  {
    icon: MessageSquare,
    title: 'Chat with AI',
    description: 'Ask questions about elections, voting, and civic engagement',
    href: '/chat',
    color: 'bg-gradient-to-br from-saffron to-orange-500',
  },
  {
    icon: Brain,
    title: 'Take Quizzes',
    description: 'Test your knowledge with AI-generated quizzes',
    href: '/learn/quiz',
    color: 'bg-gradient-to-br from-purple-500 to-pink-500',
  },
  {
    icon: Zap,
    title: 'Flashcards',
    description: 'Quick fact learning with interactive cards',
    href: '/learn/flashcards',
    color: 'bg-gradient-to-br from-yellow-400 to-orange-400',
  },
  {
    icon: BarChart3,
    title: 'Simulation',
    description: 'Experience the voting process interactively',
    href: '/learn/simulation',
    color: 'bg-gradient-to-br from-india-green to-teal-500',
  },
  {
    icon: BookOpen,
    title: 'Constitution',
    description: 'Explore the Indian Constitution chapters',
    href: '/learn/constitution',
    color: 'bg-gradient-to-br from-navy to-blue-600',
  },
  {
    icon: FileText,
    title: 'Forms Guide',
    description: 'Understand election forms 8, 9, 10 & more',
    href: '/learn/forms',
    color: 'bg-gradient-to-br from-cyan-500 to-blue-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

const statCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 20,
    },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 },
  },
};

export default function DashboardPage() {
  const t = useTranslations();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [displayedStats, setDisplayedStats] = useState([
    { value: '0', label: '94 Crore+', sublabel: 'Voters' },
    { value: '0', label: '543', sublabel: 'Lok Sabha Seats' },
    { value: '0', label: '36', sublabel: '28+8', },
  ]);

  useEffect(() => {
    const animationDuration = 2000;
    const startTime = Date.now();

    const animateNumbers = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / animationDuration, 1);

      setDisplayedStats([
        { value: '94', label: '94 Crore+', sublabel: 'Voters' },
        { value: '543', label: '543', sublabel: 'Lok Sabha Seats' },
        { value: '36', label: '28+8', sublabel: 'States & UTs' },
      ]);

      if (progress < 1) {
        requestAnimationFrame(animateNumbers);
      }
    };

    animateNumbers();
  }, []);

  const handleScrollLeft = () => {
    const container = document.getElementById('elections-ticker');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    const container = document.getElementById('elections-ticker');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const calculateCountdown = (date: string) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-civic-light pt-12 md:pt-20 pb-16 md:pb-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-saffron/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-india-green/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-civic bg-clip-text text-transparent leading-tight">
              Your Guide to India's Democracy
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Master the art of voting, understand your constitutional rights, and become an informed citizen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="default" className="gap-2 text-base font-semibold shadow-civic-lg" asChild>
                  <Link href="/learn">
                    Start Learning
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="secondary" className="gap-2 text-base font-semibold shadow-civic-lg" asChild>
                  <Link href="/chat">
                    Chat with AI
                    <MessageSquare className="w-5 h-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayedStats.map((stat, idx) => (
                <motion.div key={idx} variants={statCardVariants} whileHover="hover" className="bg-white rounded-lg p-6 shadow-civic-md border border-gray-100">
                  <div className="text-sm font-semibold text-gray-600 mb-1">{stat.sublabel}</div>
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-civic bg-clip-text text-transparent">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 md:py-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="w-8 h-8 text-saffron" />
              Upcoming Elections
            </h2>
            <p className="text-gray-600">Stay updated on election schedules across India</p>
          </motion.div>

          <div className="relative">
            <button onClick={handleScrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-saffron text-white p-2 rounded-full shadow-civic-lg hover:bg-orange-600 transition-all hidden md:block" aria-label="Scroll left">
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>

            <div id="elections-ticker" className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {mockElections.map((election, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} viewport={{ once: true }} className="flex-shrink-0 w-80 bg-white rounded-lg border-2 border-saffron/20 p-4 hover:border-saffron hover:shadow-civic-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{election.state}</h3>
                      <p className="text-sm text-gray-600">{election.type}</p>
                    </div>
                    <Badge variant="default" className="bg-saffron">{calculateCountdown(election.date)} days</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
