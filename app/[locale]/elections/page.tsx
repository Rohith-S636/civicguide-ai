'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  FileText,
  Youtube,
  Bell,
  ExternalLink,
  Search,
  ChevronRight,
  Users,
  Building2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { Sonner, toast } from 'sonner';

export default function ElectionsPage() {
  const t = useTranslations();
  const [searchForms, setSearchForms] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [announcementsPage, setAnnouncementsPage] = useState(1);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Mock election schedule data
  const electionSchedule = [
    {
      id: 1,
      state: 'Maharashtra',
      type: 'State Assembly',
      pollDates: 'Nov 20, 2024',
      resultDate: 'Nov 23, 2024',
      voters: 7200000,
      status: 'upcoming',
    },
    {
      id: 2,
      state: 'Delhi',
      type: 'State Assembly',
      pollDates: 'Feb 5, 2025',
      resultDate: 'Feb 8, 2025',
      voters: 1400000,
      status: 'upcoming',
    },
    {
      id: 3,
      state: 'Bihar',
      type: 'State Assembly',
      pollDates: 'Oct 15, 2025',
      resultDate: 'Oct 18, 2025',
      voters: 6200000,
      status: 'scheduled',
    },
    {
      id: 4,
      state: 'West Bengal',
      type: 'State Assembly',
      pollDates: 'Mar 20, 2026',
      resultDate: 'Mar 23, 2026',
      voters: 5800000,
      status: 'scheduled',
    },
    {
      id: 5,
      state: 'Tamil Nadu',
      type: 'State Assembly',
      pollDates: 'Apr 10, 2026',
      resultDate: 'Apr 13, 2026',
      voters: 3900000,
      status: 'scheduled',
    },
  ];

  const electionTypes = ['State Assembly', 'MCD', 'Local Body'];
  const years = ['2024', '2025', '2026'];
  const states = ['All', 'Maharashtra', 'Delhi', 'Bihar', 'West Bengal', 'Tamil Nadu'];

  const filteredElections = useMemo(() => {
    return electionSchedule.filter(election => {
      const stateMatch = !selectedState || selectedState === 'All' || election.state === selectedState;
      const typeMatch = !selectedType || election.type === selectedType;
      const yearMatch =
        !selectedYear ||
        (selectedYear === '2024' && election.pollDates.includes('2024')) ||
        (selectedYear === '2025' && election.pollDates.includes('2025')) ||
        (selectedYear === '2026' && election.pollDates.includes('2026'));
      return stateMatch && typeMatch && yearMatch;
    });
  }, [selectedState, selectedType, selectedYear]);

  // Forms data
  const forms = [
    { id: '6', name: 'Form 6', description: 'Application for registration as voter' },
    { id: '6A', name: 'Form 6A', description: 'Application for inclusion of name in electoral roll' },
    { id: '6B', name: 'Form 6B', description: 'Application for transposition of names' },
    { id: '7', name: 'Form 7', description: 'Application for removal of entry from electoral roll' },
    { id: '8', name: 'Form 8', description: 'Application for correction of entry in electoral roll' },
    { id: '8A', name: 'Form 8A', description: 'Application for deletion of entry' },
    { id: '12', name: 'Form 12', description: 'Application for absent voter certificate' },
    { id: '12A', name: 'Form 12A', description: 'Application for postal ballot' },
    { id: '12D', name: 'Form 12D', description: 'Application for service voter' },
    { id: '13', name: 'Form 13', description: 'Application for proxy voting' },
    { id: 'EPIC', name: 'EPIC', description: 'Voter ID card application' },
    {
      id: 'PB',
      name: 'Postal Ballot',
      description: 'Vote from anywhere through postal ballot',
    },
  ];

  const filteredForms = useMemo(() => {
    if (!searchForms) return forms;
    return forms.filter(
      form =>
        form.name.toLowerCase().includes(searchForms.toLowerCase()) ||
        form.description.toLowerCase().includes(searchForms.toLowerCase()),
    );
  }, [searchForms]);

  // Procedures
  const procedures = [
    {
      title: 'Voter Registration Process',
      steps: [
        'Check if you are already registered',
        'Fill Form 6 (Application for Registration)',
        'Submit with required documents (ID proof, address proof)',
        'Wait for verification (7-10 days)',
        'Receive voter slip / EPIC card',
      ],
    },
    {
      title: 'Correcting Voter Details',
      steps: [
        'Identify the error in your voter registration',
        'Download and fill Form 8 (Correction Application)',
        'Attach supporting documents',
        'Submit to your local election office',
        'Verification completes in 7 days',
      ],
    },
    {
      title: 'Postal Ballot / Absent Voter',
      steps: [
        'Determine your eligibility (out of state/country during elections)',
        'Fill Form 12A (Postal Ballot Application)',
        'Submit at least 10 days before election',
        'Receive ballot by mail or courier',
        'Return voted ballot before poll deadline',
      ],
    },
    {
      title: 'Service Voter Registration',
      steps: [
        'Applicable to armed forces & central government employees',
        'Fill Form 12D with service proof',
        'Get departmental authorization',
        'Submit to election office',
        'Get special service voter status',
      ],
    },
  ];

  // Videos
  const videos = [
    {
      id: 1,
      title: 'How to Register to Vote',
      thumbnail: 'https://img.youtube.com/vi/mVIpS8LV8NA/hqdefault.jpg',
      youtubeUrl: 'https://youtube.com/watch?v=mVIpS8LV8NA',
      duration: '4:32',
    },
    {
      id: 2,
      title: 'Understanding EVM (Electronic Voting Machine)',
      thumbnail: 'https://img.youtube.com/vi/52L3R8_vbFo/hqdefault.jpg',
      youtubeUrl: 'https://youtube.com/watch?v=52L3R8_vbFo',
      duration: '5:15',
    },
    {
      id: 3,
      title: 'Polling Day Process & Your Rights',
      thumbnail: 'https://img.youtube.com/vi/VvLH1iLvLe0/hqdefault.jpg',
      youtubeUrl: 'https://youtube.com/watch?v=VvLH1iLvLe0',
      duration: '6:48',
    },
  ];

  // Announcements (mock, would come from /api/notifications)
  const announcements = [
    {
      id: 1,
      date: 'Nov 10, 2024',
      category: 'Announcement',
      title: 'Election Commission Issues New Guidelines for 2024 Elections',
      source: 'ECI Official',
    },
    {
      id: 2,
      date: 'Nov 8, 2024',
      category: 'Schedule',
      title: 'Maharashtra Election Schedule Released - Voting on Nov 20',
      source: 'ECI Official',
    },
    {
      id: 3,
      date: 'Nov 5, 2024',
      category: 'Update',
      title: 'Voter Registration Camp Extended in Urban Areas',
      source: 'State Election Office',
    },
    {
      id: 4,
      date: 'Nov 1, 2024',
      category: 'Announcement',
      title: 'New Accessibility Features for Voters with Disabilities',
      source: 'ECI Official',
    },
    {
      id: 5,
      date: 'Oct 28, 2024',
      category: 'Result',
      title: 'Municipal Election Results Announced - Final Tally',
      source: 'Local Election Office',
    },
  ];

  const announcementsPerPage = 5;
  const totalPages = Math.ceil(announcements.length / announcementsPerPage);
  const paginatedAnnouncements = announcements.slice(
    (announcementsPage - 1) * announcementsPerPage,
    announcementsPage * announcementsPerPage,
  );

  const getStatusBadge = (status: string) => {
    if (status === 'upcoming') {
      return (
        <Badge className="bg-red-100 text-red-800">
          <AlertCircle className="mr-1 h-3 w-3" />
          Upcoming
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-800">
        <Calendar className="mr-1 h-3 w-3" />
        Scheduled
      </Badge>
    );
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      Announcement: 'bg-blue-100 text-blue-800',
      Schedule: 'bg-orange-100 text-orange-800',
      Update: 'bg-green-100 text-green-800',
      Result: 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-green-600 px-4 py-20 text-white sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/30">
              Official Election Information Hub
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-4 text-5xl font-bold sm:text-6xl"
          >
            Elections in India
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg opacity-90"
          >
            Complete information on election schedules, procedures, and voting guidelines from the
            Election Commission of India.
          </motion.p>
        </div>
      </motion.section>

      {/* Section 1: Election Schedule */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="flex items-center gap-3 text-4xl font-bold text-slate-900 sm:text-5xl">
              <Calendar className="h-8 w-8 text-orange-600" />
              Current Election Schedule
            </h2>
            <p className="mt-2 text-slate-600">
              Upcoming elections across states and municipalities in India
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants} className="mb-8 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                {states.map(state => (
                  <option key={state} value={state === 'All' ? '' : state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Election Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="">All Types</option>
                {electionTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div variants={itemVariants} className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="overflow-hidden rounded-lg border border-slate-200 shadow-md">
                <table className="w-full divide-y divide-slate-200">
                  <thead className="bg-gradient-to-r from-slate-100 to-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        State
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Poll Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Result Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Voters
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredElections.map(election => (
                      <tr key={election.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-medium text-slate-900">
                            <MapPin className="h-4 w-4 text-orange-600" />
                            {election.state}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{election.type}</td>
                        <td className="px-6 py-4 text-slate-600">{election.pollDates}</td>
                        <td className="px-6 py-4 text-slate-600">{election.resultDate}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {(election.voters / 1000000).toFixed(1)}M
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(election.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredElections.length === 0 && (
                  <div className="px-6 py-8 text-center text-slate-600">
                    No elections match your filters. Try adjusting your selection.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Section 2: Election Commission of India */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-slate-100 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="flex items-center gap-3 text-4xl font-bold text-slate-900 sm:text-5xl">
              <Building2 className="h-8 w-8 text-blue-600" />
              Election Commission of India
            </h2>
          </motion.div>

          {/* About ECI */}
          <motion.div variants={itemVariants} className="mb-12">
            <Card className="border-0 bg-white shadow-lg">
              <CardHeader>
                <CardTitle>About the ECI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  The Election Commission of India (ECI) is a constitutional body established under
                  <span className="font-semibold"> Article 324 of the Indian Constitution</span>.
                  It operates independently and impartially to ensure free and fair elections across
                  India.
                </p>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">Key Responsibilities:</h4>
                    <ul className="list-disc list-inside text-slate-600 space-y-1">
                      <li>Conduct elections to the Lok Sabha and Rajya Sabha</li>
                      <li>Conduct elections to State Legislative Assemblies</li>
                      <li>Maintain the electoral roll</li>
                      <li>Enforce the Model Code of Conduct</li>
                      <li>Regulate political parties and candidates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chief Election Commissioner */}
          <motion.div variants={itemVariants} className="mb-12">
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  Chief Election Commissioner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Current CEC</p>
                  <p className="text-2xl font-bold text-slate-900">Rajiv Kumar</p>
                  <p className="text-sm text-slate-600 mt-1">Term: June 2023 - November 2024</p>
                </div>
                <p className="text-slate-700">
                  The Chief Election Commissioner heads the Election Commission and is responsible
                  for the overall administration of elections in India.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Official Links Grid */}
          <motion.div variants={itemVariants}>
            <h3 className="mb-6 text-2xl font-bold text-slate-900">Official Links</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Main Website',
                  url: 'https://eci.gov.in',
                  icon: '🌐',
                  description: 'Official ECI homepage',
                },
                {
                  title: 'Voter Portal',
                  url: 'https://voters.eci.gov.in',
                  icon: '👥',
                  description: 'Check voter registration',
                },
                {
                  title: 'Voter Search',
                  url: 'https://electoralsearch.eci.gov.in',
                  icon: '🔍',
                  description: 'Search electoral roll',
                },
                {
                  title: 'NVSP',
                  url: 'https://nvsp.in',
                  icon: '📝',
                  description: 'National Voter Service Portal',
                },
                {
                  title: 'SVEEP',
                  url: 'https://ecisveep.nic.in',
                  icon: '📢',
                  description: 'Systematic Voters Education',
                },
                {
                  title: 'ECI Helpline',
                  url: 'tel:1950',
                  icon: '☎️',
                  description: 'Call 1950 for assistance',
                },
              ].map((link, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <Card className="border-0 bg-white shadow-md transition-all hover:shadow-lg hover:scale-105 h-full cursor-pointer">
                      <CardHeader>
                        <div className="mb-2 text-4xl">{link.icon}</div>
                        <CardTitle className="text-lg">{link.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col justify-between h-full">
                        <p className="text-sm text-slate-600 mb-4">{link.description}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                        >
                          Visit <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Section 3: Forms & Procedures */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="flex items-center gap-3 text-4xl font-bold text-slate-900 sm:text-5xl">
              <FileText className="h-8 w-8 text-green-600" />
              Forms & Procedures
            </h2>
            <p className="mt-2 text-slate-600">Complete guide to electoral forms and voting procedures</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div variants={itemVariants} className="mb-8 relative">
            <div className="relative">
              <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search forms (e.g., 'voter registration', 'Form 6')"
                value={searchForms}
                onChange={(e) => setSearchForms(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>
            {searchForms && (
              <p className="mt-2 text-sm text-slate-600">
                Found {filteredForms.length} form(s) matching your search
              </p>
            )}
          </motion.div>

          {/* Forms Grid */}
          <motion.div variants={containerVariants} className="mb-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredForms.map(form => (
              <motion.div key={form.id} variants={itemVariants}>
                <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50 shadow-md transition-all hover:shadow-lg h-full">
                  <CardHeader>
                    <Badge className="w-fit bg-green-200 text-green-800 mb-2">
                      {form.id}
                    </Badge>
                    <CardTitle className="text-lg">{form.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-between h-full gap-4">
                    <p className="text-sm text-slate-700">{form.description}</p>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Apply Now <ChevronRight className="ml-2 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {filteredForms.length === 0 && (
            <motion.div variants={itemVariants} className="py-8 text-center text-slate-600">
              No forms match your search. Try a different keyword.
            </motion.div>
          )}

          {/* Procedures Accordion */}
          <motion.div variants={itemVariants} className="mt-12">
            <h3 className="mb-6 text-2xl font-bold text-slate-900">Step-by-Step Procedures</h3>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {procedures.map((procedure, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b-0 px-6">
                      <AccordionTrigger className="hover:text-green-600 py-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="font-semibold text-slate-900">{procedure.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <ol className="space-y-3 ml-8">
                          {procedure.steps.map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-start gap-3 text-slate-700">
                              <span className="flex-shrink-0 font-bold text-green-600 w-6">
                                {stepIndex + 1}.
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* Section 4: Government Videos */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-slate-100 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="flex items-center gap-3 text-4xl font-bold text-slate-900 sm:text-5xl">
              <Youtube className="h-8 w-8 text-red-600" />
              Official Government Videos
            </h2>
            <p className="mt-2 text-slate-600">Learn from official ECI videos</p>
          </motion.div>

          <motion.div variants={containerVariants} className="grid gap-6 md:grid-cols-3">
            {videos.map(video => (
              <motion.div key={video.id} variants={itemVariants}>
                <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  <Card className="border-0 shadow-lg overflow-hidden transition-all hover:shadow-xl hover:scale-105 cursor-pointer">
                    <div className="relative bg-black overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-40 object-cover hover:opacity-75 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                        <div className="rounded-full bg-red-600 p-3">
                          <Youtube className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <Badge className="absolute bottom-2 right-2 bg-black/70 text-white hover:bg-black/80">
                        {video.duration}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        size="sm"
                      >
                        Watch on YouTube <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Section 5: Announcements Feed */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="flex items-center gap-3 text-4xl font-bold text-slate-900 sm:text-5xl">
              <Bell className="h-8 w-8 text-orange-600" />
              Latest Announcements
            </h2>
            <p className="mt-2 text-slate-600">Stay updated with ECI announcements</p>
          </motion.div>

          <motion.div variants={containerVariants} className="space-y-4">
            {paginatedAnnouncements.map(announcement => (
              <motion.div key={announcement.id} variants={itemVariants}>
                <Card className="border-0 bg-white shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-slate-500">{announcement.date}</span>
                          <Badge className={getCategoryBadgeColor(announcement.category)}>
                            {announcement.category}
                          </Badge>
                          <span className="text-xs text-slate-500 ml-auto">
                            {announcement.source}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {announcement.title}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          <motion.div variants={itemVariants} className="mt-8 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Page {announcementsPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={announcementsPage === 1}
                onClick={() => setAnnouncementsPage(announcementsPage - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={announcementsPage === totalPages}
                onClick={() => setAnnouncementsPage(announcementsPage + 1)}
              >
                Next
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-16 text-white sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2 variants={itemVariants} className="text-4xl font-bold sm:text-5xl">
            Ready to Learn More?
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-4 text-lg opacity-90">
            Ask CivicGuide AI any questions about elections, voting, or civic processes.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link href="/en/chat">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
                Ask a Question <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/en/about">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                Learn About Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-12 text-center text-slate-600 sm:px-6 lg:px-8">
        <p className="text-sm">
          Information sourced from the Election Commission of India (eci.gov.in). 
          © 2024 CivicGuide AI.
        </p>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <Link href="/privacy" className="hover:text-slate-900">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-slate-900">
            Terms
          </Link>
          <a href="https://eci.gov.in" className="hover:text-slate-900">
            Visit ECI
          </a>
        </div>
      </footer>
    </div>
  );
}
