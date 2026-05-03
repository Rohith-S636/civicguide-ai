'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Star,
  CheckCircle,
  BookOpen,
  Zap,
  Users,
  Volume2,
  Home,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useFlashcardStore, Flashcard } from '@/store/useQuizFlashcardStore';

// Sample Flashcards (25 cards)
const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc1',
    category: 'terms',
    term: 'EVM',
    definition: 'Electronic Voting Machine - a device used to record and count votes electronically in elections.',
    example: 'EVMs have replaced paper ballots in most Indian elections since 2004, making voting faster and more reliable.',
    language: 'en',
  },
  {
    id: 'fc2',
    category: 'terms',
    term: 'VVPAT',
    definition: 'Voter Verified Paper Audit Trail - a device that produces a printed paper slip to verify that the vote was cast correctly.',
    example: 'VVPAT machines are now mandatory in all elections to ensure transparency and allow voters to verify their choice.',
    language: 'en',
  },
  {
    id: 'fc3',
    category: 'terms',
    term: 'Model Code of Conduct',
    definition: 'A set of guidelines issued by the Election Commission to ensure free and fair elections and prevent electoral malpractices.',
    example: 'During elections, the Model Code prohibits use of government resources for campaigning and limits campaign timings.',
    language: 'en',
  },
  {
    id: 'fc4',
    category: 'terms',
    term: 'Electoral Roll',
    definition: 'The official list of all qualified voters in a constituency who are eligible to vote in elections.',
    example: 'Citizens must be registered in the Electoral Roll before they can vote. Registration is done through Form 6.',
    language: 'en',
  },
  {
    id: 'fc5',
    category: 'terms',
    term: 'ECI',
    definition: 'Election Commission of India - the constitutional authority responsible for conducting elections and enforcing electoral laws.',
    example: 'The ECI conducts Lok Sabha, state assembly, and local body elections across India.',
    language: 'en',
  },
  {
    id: 'fc6',
    category: 'terms',
    term: 'CEC',
    definition: 'Chief Election Commissioner - the head of the Election Commission of India who oversees all electoral processes.',
    example: 'The CEC is appointed by the President and serves for a fixed term of 6 years.',
    language: 'en',
  },
  {
    id: 'fc7',
    category: 'processes',
    term: 'Form 6',
    definition: 'Application form for inclusion in the Electoral Roll for a particular constituency.',
    example: 'An Indian citizen aged 18+ who meets residency requirements can apply using Form 6 to register as a voter.',
    language: 'en',
  },
  {
    id: 'fc8',
    category: 'processes',
    term: 'Form 7',
    definition: 'Application form for deletion from the Electoral Roll (used when a person no longer meets eligibility criteria).',
    example: 'If you move outside a constituency, you can apply for deletion using Form 7.',
    language: 'en',
  },
  {
    id: 'fc9',
    category: 'processes',
    term: 'Form 8',
    definition: 'Application form for objection to an entry in the Electoral Roll.',
    example: 'If you find an incorrect entry in the Electoral Roll, you can file an objection using Form 8.',
    language: 'en',
  },
  {
    id: 'fc10',
    category: 'processes',
    term: 'Polling Booth',
    definition: 'The location where voters cast their votes during elections, typically set up in schools or community centers.',
    example: 'Each polling booth is assigned a specific number of voters and is staffed by election officials.',
    language: 'en',
  },
  {
    id: 'fc11',
    category: 'processes',
    term: 'Voting Process Steps',
    definition: '1) Voter identification 2) Vote casting 3) VVPAT verification 4) Voter mark in register',
    example: 'At a polling booth, voters are identified, they cast votes on the EVM, verify with VVPAT, and their names are marked as voted.',
    language: 'en',
  },
  {
    id: 'fc12',
    category: 'processes',
    term: 'Vote Counting',
    definition: 'The process of tallying votes after the election day. Results are counted in front of observers from different parties.',
    example: 'Vote counting usually happens the day after elections and continues until all votes are tallied and official results are announced.',
    language: 'en',
  },
  {
    id: 'fc13',
    category: 'articles',
    term: 'Part III - Fundamental Rights',
    definition: 'Articles 12-35 of the Indian Constitution guarantee fundamental rights to all citizens including equality, freedom, and right to vote.',
    example: 'The right to vote is considered a fundamental democratic right under Part III of the Constitution.',
    language: 'en',
  },
  {
    id: 'fc14',
    category: 'articles',
    term: 'Article 326',
    definition: 'Provides for the adult franchise - all Indian citizens aged 18 or above have the right to vote.',
    example: 'Article 326 is the constitutional basis for universal adult suffrage in India.',
    language: 'en',
  },
  {
    id: 'fc15',
    category: 'articles',
    term: 'Article 325',
    definition: 'Provides for the purity of elections by requiring elections to be conducted on the basis of one person, one vote, one value.',
    example: 'No person can be disqualified from voting based on religion, caste, gender, or any other criterion.',
    language: 'en',
  },
  {
    id: 'fc16',
    category: 'articles',
    term: 'Article 324',
    definition: 'Establishes the Election Commission of India and grants it superintendence, direction, and control of elections.',
    example: 'Under Article 324, the ECI is an independent constitutional body that ensures free and fair elections.',
    language: 'en',
  },
  {
    id: 'fc17',
    category: 'people',
    term: 'Dr. B.R. Ambedkar',
    definition: 'Principal architect of the Indian Constitution and first Law Minister, who emphasized voting rights for all.',
    example: 'Ambedkar fought for the rights of marginalized communities and ensured universal adult suffrage in the Constitution.',
    language: 'en',
  },
  {
    id: 'fc18',
    category: 'people',
    term: 'Rajendra Prasad',
    definition: 'First President of India who promulgated the Constitution and established democratic traditions.',
    example: 'Rajendra Prasad played a key role in shaping India\'s democratic institutions and election systems.',
    language: 'en',
  },
  {
    id: 'fc19',
    category: 'people',
    term: 'Sunil Arora',
    definition: 'Former Chief Election Commissioner of India known for introducing advanced voting technology.',
    example: 'Sunil Arora led the implementation of VVPAT machines and enhanced electoral transparency during his tenure.',
    language: 'en',
  },
  {
    id: 'fc20',
    category: 'events',
    term: 'First Lok Sabha Elections (1951-52)',
    definition: 'The first general elections in independent India, establishing the democratic foundation for the nation.',
    example: 'India conducted elections on a massive scale and chose its first parliament, making it the world\'s largest democratic exercise.',
    language: 'en',
  },
  {
    id: 'fc21',
    category: 'events',
    term: '19th Lok Sabha Elections (2019)',
    definition: 'The largest democratic exercise ever conducted, spanning 39 days with voting in 7 phases.',
    example: 'Over 900 million eligible voters participated in 2019 elections across India.',
    language: 'en',
  },
  {
    id: 'fc22',
    category: 'events',
    term: 'Introduction of EVMs (2004)',
    definition: 'The year when Electronic Voting Machines were first used in general elections across all constituencies.',
    example: 'The transition from paper ballots to EVMs improved efficiency and reduced counting errors significantly.',
    language: 'en',
  },
  {
    id: 'fc23',
    category: 'events',
    term: 'Women Suffrage Achievement',
    definition: 'India granted equal voting rights to women from independence, making it the first major nation to do so.',
    example: 'From 1950, Indian women have had the right to vote on equal terms with men.',
    language: 'en',
  },
  {
    id: 'fc24',
    category: 'events',
    term: '18th Amendment (2019)',
    definition: 'Reduced the minimum voting age from 21 to 18 years, enabling more youth participation in elections.',
    example: 'This amendment expanded the electoral base and gave younger citizens a voice in democratic processes.',
    language: 'en',
  },
  {
    id: 'fc25',
    category: 'events',
    term: 'VVPAT Implementation (2014)',
    definition: 'Election Commission introduced VVPAT machines in select constituencies to ensure electoral transparency.',
    example: 'By 2019, all polling stations were equipped with VVPAT machines for voter verification.',
    language: 'en',
  },
];

type StudyMode = 'all' | 'starred' | 'not_learned';
type CategoryFilter = 'all' | 'terms' | 'processes' | 'articles' | 'people' | 'events';

export default function FlashcardsPage() {
  const t = useTranslations();
  const [studyMode, setStudyMode] = useState<StudyMode>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [language, setLanguage] = useState<'en' | 'hi' | 'te' | 'ta'>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    currentSession,
    isFlipped,
    initializeFlashcards,
    nextCard,
    previousCard,
    shuffleCards,
    toggleFlip,
    toggleStar,
    toggleLearned,
    setStudyMode: setStoreStudyMode,
    resetFlashcards,
    getCurrentCard,
    getVisibleCards,
    getProgress,
    getStatistics,
  } = useFlashcardStore();

  // Initialize flashcards on mount
  useEffect(() => {
    if (!currentSession && !isInitialized) {
      initializeFlashcards(SAMPLE_FLASHCARDS, language);
      setIsInitialized(true);
    }
  }, [currentSession, isInitialized, initializeFlashcards, language]);

  const handleStudyModeChange = (mode: StudyMode) => {
    setStudyMode(mode);
    setStoreStudyMode(mode);
  };

  const handleCategoryChange = (category: CategoryFilter) => {
    setCategoryFilter(category);
    if (category === 'all') {
      // Just filter UI-side for now
    }
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-civic rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  const currentCard = getCurrentCard();
  const visibleCards = getVisibleCards();
  const progress = getProgress();
  const stats = getStatistics();

  // Filter cards by category for display
  const filteredCards = categoryFilter === 'all'
    ? visibleCards
    : visibleCards.filter((card) => card.category === categoryFilter);

  const currentFilteredCard = filteredCards[0];
  const categoryName = categoryFilter === 'all' ? 'All' : categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1);

  return (
    <div className="min-h-screen bg-gradient-civic-light py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-civic rounded-lg flex items-center justify-center text-white font-bold">
                CG
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Flashcards</h1>
                <p className="text-gray-600">Master civic concepts with interactive cards</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetFlashcards();
                setStudyMode('all');
                setCategoryFilter('all');
                setIsInitialized(false);
              }}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Card {progress.current} of {progress.total}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {Math.round((progress.current / progress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-gray-200">
              <motion.div
                className="h-full bg-gradient-civic"
                animate={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Study Modes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Study Mode
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { mode: 'all', label: '📚 All Cards', icon: BookOpen },
              { mode: 'starred', label: '⭐ Starred Only', icon: Star },
              { mode: 'not_learned', label: '🎯 Not Learned', icon: Zap },
            ].map((item) => (
              <motion.button
                key={item.mode}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStudyModeChange(item.mode as StudyMode)}
                className={`p-3 rounded-lg border-2 transition-all font-medium flex items-center justify-between ${
                  studyMode === item.mode
                    ? 'border-saffron bg-gradient-civic-light text-saffron'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Category
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: 'all', label: 'All' },
              { value: 'terms', label: '📖 Terms' },
              { value: 'processes', label: '⚙️ Processes' },
              { value: 'articles', label: '📜 Articles' },
              { value: 'people', label: '👥 People' },
              { value: 'events', label: '📅 Events' },
            ].map((cat) => (
              <motion.button
                key={cat.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryChange(cat.value as CategoryFilter)}
                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  categoryFilter === cat.value
                    ? 'bg-saffron text-white shadow-civic-md'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-saffron'
                }`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-navy">{stats.total}</p>
            <p className="text-xs text-gray-600 mt-1">Total Cards</p>
          </Card>
          <Card className="p-4 text-center bg-yellow-50 border-yellow-200">
            <p className="text-2xl font-bold text-yellow-600">{stats.starred}</p>
            <p className="text-xs text-gray-600 mt-1">Starred</p>
          </Card>
          <Card className="p-4 text-center bg-green-50 border-green-200">
            <p className="text-2xl font-bold text-india-green">{stats.learned}</p>
            <p className="text-xs text-gray-600 mt-1">Learned</p>
          </Card>
        </motion.div>

        {/* Flashcard Display */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <AnimatePresence mode="wait">
            {currentFilteredCard ? (
              <motion.div
                key={currentFilteredCard.id}
                initial={{ opacity: 0, rotateY: 180 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -180 }}
                transition={{ duration: 0.5 }}
                onClick={toggleFlip}
                style={{ perspective: '1000px' }}
              >
                {/* 3D Card Flip */}
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                  className="cursor-pointer"
                >
                  {/* Front of card */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                    }}
                    className="min-h-96 bg-gradient-to-br from-saffron to-orange-500 rounded-2xl p-8 shadow-civic-xl flex items-center justify-center text-white"
                  >
                    <div className="text-center">
                      <p className="text-sm font-semibold opacity-75 mb-4 uppercase tracking-wide">
                        Question
                      </p>
                      <h2 className="text-4xl md:text-5xl font-bold leading-tight break-words">
                        {currentFilteredCard.term}
                      </h2>
                      <p className="text-sm opacity-75 mt-8">Click to reveal answer</p>
                    </div>
                  </div>

                  {/* Back of card */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                    className="absolute inset-0 min-h-96 bg-gradient-to-br from-india-green to-teal-600 rounded-2xl p-8 shadow-civic-xl flex items-center justify-center text-white"
                  >
                    <div className="space-y-6 w-full">
                      <div>
                        <p className="text-sm font-semibold opacity-75 mb-2 uppercase tracking-wide">
                          Answer
                        </p>
                        <p className="text-xl md:text-2xl font-semibold leading-relaxed">
                          {currentFilteredCard.definition}
                        </p>
                      </div>

                      {currentFilteredCard.example && (
                        <div className="pt-4 border-t border-white/30">
                          <p className="text-sm font-semibold opacity-75 mb-2 uppercase tracking-wide">
                            Example
                          </p>
                          <p className="text-base opacity-90 italic">
                            "{currentFilteredCard.example}"
                          </p>
                        </div>
                      )}

                      <p className="text-xs opacity-60 pt-4">Click to see question</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-96 bg-white rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300"
              >
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    No cards in this view
                  </p>
                  <p className="text-gray-600">Try adjusting your filters</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Card Actions */}
        {currentFilteredCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3 mb-8 flex-wrap justify-center"
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toggleStar(currentFilteredCard.id)}
              className="gap-2"
            >
              <Star
                className={`w-4 h-4 ${
                  currentSession?.starredCards.includes(currentFilteredCard.id)
                    ? 'fill-current'
                    : ''
                }`}
              />
              {currentSession?.starredCards.includes(currentFilteredCard.id)
                ? 'Starred'
                : 'Star'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                toggleLearned(currentFilteredCard.id);
                toast.success(
                  currentSession?.learnedCards.includes(currentFilteredCard.id)
                    ? 'Marked as learning'
                    : 'Marked as learned!'
                );
              }}
              className="gap-2"
            >
              <CheckCircle
                className={`w-4 h-4 ${
                  currentSession?.learnedCards.includes(currentFilteredCard.id)
                    ? 'text-india-green'
                    : ''
                }`}
              />
              {currentSession?.learnedCards.includes(currentFilteredCard.id)
                ? 'Learned'
                : 'Not Learned'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={shuffleCards}
              className="gap-2"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </Button>
          </motion.div>
        )}

        {/* Navigation Controls */}
        {currentFilteredCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 justify-center items-center"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={previousCard}
              disabled={progress.current === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </Button>

            <div className="px-6 py-3 bg-white rounded-lg border-2 border-saffron text-center min-w-fit">
              <p className="text-sm text-gray-600">Card</p>
              <p className="text-2xl font-bold text-saffron">
                {progress.current} / {progress.total}
              </p>
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={nextCard}
              disabled={progress.current === progress.total}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 p-6 bg-blue-50 rounded-lg border-l-4 border-navy text-center"
        >
          <p className="text-sm text-navy font-semibold mb-2">💡 Study Tip</p>
          <p className="text-sm text-navy/80">
            Review cards regularly, star the ones you find difficult, and mark them as learned when you're confident.
            Shuffle the deck to test your knowledge in random order.
          </p>
        </motion.div>

        {/* Back to Learn Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex justify-center"
        >
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/learn">
              <Home className="w-4 h-4" />
              Back to Learning Hub
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
