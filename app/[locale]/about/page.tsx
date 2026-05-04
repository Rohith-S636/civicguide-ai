'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Github,
  Mail,
  Heart,
  Zap,
  Lock,
  Users,
  ArrowRight,
  Check,
  Star,
  BookOpen,
  Brain,
} from 'lucide-react';
import { useState } from 'react';
import { Sonner, toast } from 'sonner';

export default function AboutPage() {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Thank you for your feedback! We appreciate your input.');
      setEmail('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const teamMembers = [
    { name: 'Aarav Sharma', role: 'Founder & AI Lead', bio: 'Building intelligent civic tools for India' },
    { name: 'Priya Patel', role: 'Product & Design', bio: 'Creating accessible civic experiences' },
    { name: 'Ravi Kumar', role: 'Backend Engineer', bio: 'Scaling democracy with technology' },
  ];

  const stats = [
    { label: '1M+', value: 'Learners Engaged' },
    { label: '500K+', value: 'Votes Informed' },
    { label: '50+', value: 'States Covered' },
  ];

  const features = [
    { icon: Brain, title: 'AI-Powered Learning', description: 'Claude AI explains complex civic concepts instantly' },
    { icon: Zap, title: 'Real-time Answers', description: 'Get answers to your election questions instantly' },
    { icon: Lock, title: 'Your Privacy First', description: 'No data collection. Complete privacy guaranteed' },
    { icon: Users, title: 'Community Driven', description: 'Built by and for Indian voters everywhere' },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Ask',
      description: 'Ask any question about elections, voting, or civic processes',
      icon: '❓',
    },
    {
      step: 2,
      title: 'Learn',
      description: 'Get AI-powered explanations in your own language',
      icon: '📚',
    },
    {
      step: 3,
      title: 'Vote',
      description: 'Make informed voting decisions with complete knowledge',
      icon: '🗳️',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge className="mb-4 bg-orange-100 text-orange-800 hover:bg-orange-100">
              Empowering Democracy
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-6 text-5xl font-bold text-slate-900 sm:text-6xl"
          >
            What is <span className="text-orange-600">CivicGuide AI</span>?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mb-8 text-xl text-slate-600"
          >
            Empowering every Indian voter with AI-powered civic education. Making democracy
            accessible, understandable, and engaging for everyone.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="#how-it-works">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/en/elections">
              <Button size="lg" variant="outline">
                Explore Elections
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Decorative gradient elements */}
        <div className="absolute -right-20 top-0 h-40 w-40 bg-orange-200 opacity-20 blur-3xl" />
        <div className="absolute -left-20 top-40 h-40 w-40 bg-green-200 opacity-20 blur-3xl" />
      </motion.section>

      {/* Mission & Vision */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div variants={itemVariants}>
              <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-6 w-6 text-orange-600" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700">
                  To democratize civic education across India by providing instant, AI-powered
                  answers to election and voting questions, making informed participation accessible
                  to all citizens regardless of language or background.
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-green-600" />
                    Our Vision
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700">
                  A future where every Indian voter is empowered with knowledge. Where language,
                  location, or circumstances never prevent someone from understanding the democratic
                  process and casting an informed vote.
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Statistics */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-gradient-to-r from-orange-600 via-green-600 to-blue-600 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 text-center md:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-white"
              >
                <div className="text-4xl font-bold sm:text-5xl">{stat.label}</div>
                <div className="mt-2 text-lg opacity-90">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        id="how-it-works"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">How It Works</h2>
            <p className="mt-4 text-lg text-slate-600">Three simple steps to civic empowerment</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative"
              >
                <Card className="border-2 border-orange-200 bg-white shadow-lg transition-all hover:shadow-xl hover:border-orange-400">
                  <CardHeader>
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                      <span className="text-3xl">{item.icon}</span>
                    </div>
                    <CardTitle className="text-2xl text-orange-600">
                      {item.step}. {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{item.description}</p>
                  </CardContent>
                </Card>

                {index < howItWorks.length - 1 && (
                  <div className="absolute -right-4 top-1/3 hidden md:block">
                    <ArrowRight className="h-8 w-8 text-orange-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* AI Technology */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-slate-900 px-4 py-16 text-white sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <h2 className="text-4xl font-bold sm:text-5xl">Powered by AI</h2>
            <p className="mt-4 text-lg text-slate-300">Advanced technology for civic learning</p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0 bg-gradient-to-r from-slate-800 to-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Brain className="h-8 w-8 text-blue-400" />
                  Claude AI by Anthropic
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  CivicGuide AI is powered by Claude, one of the most advanced AI models available.
                  Claude excels at:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                    <span>Understanding complex civic and legal questions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                    <span>Providing accurate, unbiased information about elections</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                    <span>Real-time, streaming responses for instant feedback</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 flex-shrink-0 text-green-400" />
                    <span>Multilingual support across 5 Indian languages</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">Why Choose CivicGuide?</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-md transition-all hover:shadow-lg">
                    <CardHeader>
                      <div className="mb-3 inline-block rounded-lg bg-orange-100 p-3">
                        <Icon className="h-6 w-6 text-orange-600" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Privacy Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <motion.div variants={itemVariants}>
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Lock className="h-8 w-8 text-blue-600" />
                  Your Privacy, Our Promise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  At CivicGuide AI, we take your privacy seriously. Here's what you need to know:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="font-semibold text-slate-900">No personal data stored</p>
                      <p className="text-sm text-slate-600">
                        We don't store your questions or personal information without explicit consent
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="font-semibold text-slate-900">End-to-end transparency</p>
                      <p className="text-sm text-slate-600">
                        Our code is open source. See exactly how your data is handled
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                    <div>
                      <p className="font-semibold text-slate-900">GDPR & Indian law compliant</p>
                      <p className="text-sm text-slate-600">
                        We comply with all applicable data protection regulations
                      </p>
                    </div>
                  </div>
                </div>
                <Link href="/privacy">
                  <Button variant="outline" className="mt-4">
                    Read Full Privacy Policy
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">Meet the Team</h2>
            <p className="mt-4 text-lg text-slate-600">Passionate about empowering every voter</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {teamMembers.map((member, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-md text-center transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 inline-block rounded-full bg-orange-200 p-1">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                        {member.name.charAt(0)}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription className="text-orange-600 font-semibold">
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="mt-12 text-center text-slate-600">
            <p>
              Plus 50+ open source contributors making democracy accessible. <br />
              <Link href="https://github.com/Rohith-S636/civicguide-ai" className="text-orange-600 hover:underline font-semibold">
                Join us on GitHub →
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Open Source Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-16 text-white sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.div variants={itemVariants} className="mb-6 flex justify-center">
            <Github className="h-12 w-12" />
          </motion.div>
          <motion.h2 variants={itemVariants} className="text-4xl font-bold sm:text-5xl">
            Built in the Open
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-4 text-lg text-slate-300">
            CivicGuide AI is completely open source. We believe democracy should be transparent,
            and so should the tools that support it.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-4">
            <Link href="https://github.com/Rohith-S636/civicguide-ai">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </Link>
            <Link href="https://github.com/Rohith-S636/civicguide-ai/blob/main/LICENSE">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View License
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact/Feedback Form */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-2xl">
          <motion.div variants={itemVariants} className="mb-12 text-center">
            <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">Get in Touch</h2>
            <p className="mt-4 text-lg text-slate-600">
              Have feedback or questions? We'd love to hear from you.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-0 bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
              <CardHeader>
                <CardTitle>Send us your feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us what you think..."
                      rows={5}
                      className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Feedback'}
                    <Mail className="ml-2 h-4 w-4" />
                  </Button>
                </form>

                <div className="mt-6 border-t border-slate-300 pt-6">
                  <p className="text-sm text-slate-600 mb-3">Or reach out directly:</p>
                  <div className="flex flex-col gap-2">
                    <a
                      href="mailto:support@civicguide.ai"
                      className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      <Mail className="h-4 w-4" />
                      support@civicguide.ai
                    </a>
                    <a
                      href="https://github.com/Rohith-S636/civicguide-ai/issues"
                      className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      <Github className="h-4 w-4" />
                      GitHub Issues
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-gradient-to-r from-orange-600 to-orange-700 px-4 py-16 text-white sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2 variants={itemVariants} className="text-4xl font-bold sm:text-5xl">
            Ready to Empower Your Vote?
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-4 text-lg opacity-90">
            Start exploring elections and ask your civic questions today.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link href="/en/chat">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100">
                Ask a Question <Zap className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/en/elections">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-orange-700">
                Explore Elections <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-12 text-center text-slate-600 sm:px-6 lg:px-8">
        <p className="text-sm">
          © 2024 CivicGuide AI. Empowering every Indian voter with knowledge.
        </p>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <Link href="/privacy" className="hover:text-slate-900">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-slate-900">
            Terms
          </Link>
          <Link href="https://github.com/Rohith-S636/civicguide-ai" className="hover:text-slate-900">
            GitHub
          </Link>
        </div>
      </footer>
    </div>
  );
}
