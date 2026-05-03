'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';
import {
  RotateCcw,
  Play,
  Share2,
  ChevronRight,
  Trophy,
  Zap,
  Clock,
  Target,
  Filter,
  Loader,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useQuizStore, QuizQuestion, QuizDifficulty, QuizCategory } from '@/store/useQuizFlashcardStore';
import { useAuthStore } from '@/store/useAuthStore';

// Fallback sample quiz questions
const SAMPLE_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What is the primary purpose of elections in a democracy?',
    options: [
      'To determine the leaders of the country',
      'To collect taxes from citizens',
      'To create laws without debate',
      'To distribute wealth equally',
    ],
    correctAnswer: 0,
    explanation: 'Elections allow citizens to choose their representatives and leaders, which is fundamental to democratic governance.',
    category: 'general_election',
    difficulty: 'beginner',
    language: 'en',
  },
  {
    id: 'q2',
    question: 'What does VVPAT stand for?',
    options: [
      'Verified Voter Paper Audit Trail',
      'Voter Verification Paper Authentication Tool',
      'Valid Voting Paper Audit Trail',
      'Voter Verification and Processing Authentication Tool',
    ],
    correctAnswer: 0,
    explanation: 'VVPAT (Voter Verified Paper Audit Trail) is a device that allows voters to verify their votes before submission to ensure voting machine accuracy.',
    category: 'voting_process',
    difficulty: 'student',
    language: 'en',
  },
  {
    id: 'q3',
    question: 'How many Lok Sabha seats are there in India?',
    options: ['500', '543', '545', '550'],
    correctAnswer: 1,
    explanation: 'The Lok Sabha (House of the People) has 543 seats, with 530 representing states and 13 representing union territories.',
    category: 'general_election',
    difficulty: 'beginner',
    language: 'en',
  },
  {
    id: 'q4',
    question: 'What is the Model Code of Conduct in elections?',
    options: [
      'A technical code for voting machines',
      'A set of guidelines for election conduct to ensure fairness',
      'A DNA model for candidates',
      'A mathematical formula for vote counting',
    ],
    correctAnswer: 1,
    explanation: 'The Model Code of Conduct is a set of guidelines issued by the Election Commission to ensure free and fair elections and prevent electoral malpractices.',
    category: 'current_affairs',
    difficulty: 'student',
    language: 'en',
  },
  {
    id: 'q5',
    question: 'Which article of the Indian Constitution guarantees the right to vote?',
    options: ['Article 19', 'Article 21', 'Part III', 'No specific article - it\'s a constitutional right'],
    correctAnswer: 3,
    explanation: 'While voting rights are not mentioned in the Articles but rather in the Constitutional provisions, they are guaranteed as a fundamental democratic right.',
    category: 'constitution',
    difficulty: 'exam',
    language: 'en',
  },
  {
    id: 'q6',
    question: 'What is an EVM in the context of elections?',
    options: [
      'Electronic Value Machine',
      'Electoral Voting Mechanism',
      'Electronic Voting Machine',
      'Election Verification Module',
    ],
    correctAnswer: 2,
    explanation: 'EVM (Electronic Voting Machine) is used to record and count votes electronically in elections, replacing traditional ballot papers.',
    category: 'voting_process',
    difficulty: 'beginner',
    language: 'en',
  },
  {
    id: 'q7',
    question: 'What does Form 6 refer to in elections?',
    options: [
      'Voter ID form',
      'Application for inclusion in electoral roll',
      'Nomination form for candidates',
      'Election result form',
    ],
    correctAnswer: 1,
    explanation: 'Form 6 is used by Indian citizens to apply for inclusion or claim entry in the electoral roll for a particular constituency.',
    category: 'voting_process',
    difficulty: 'student',
    language: 'en',
  },
  {
    id: 'q8',
    question: 'Who heads the Election Commission of India?',
    options: [
      'The Prime Minister',
      'The Chief Election Commissioner',
      'The President',
      'The Speaker of Lok Sabha',
    ],
    correctAnswer: 1,
    explanation: 'The Chief Election Commissioner heads the Election Commission of India, which is responsible for conducting elections and enforcing electoral laws.',
    category: 'general_election',
    difficulty: 'beginner',
    language: 'en',
  },
  {
    id: 'q9',
    question: 'What is the voting age in India?',
    options: ['16 years', '18 years', '21 years', '25 years'],
    correctAnswer: 1,
    explanation: 'The minimum voting age in India is 18 years. Citizens who are 18 or above are eligible to vote in elections.',
    category: 'voting_process',
    difficulty: 'beginner',
    language: 'en',
  },
  {
    id: 'q10',
    question: 'How often are Lok Sabha elections held in India?',
    options: [
      'Every 2 years',
      'Every 3 years',
      'Every 5 years',
      'Every 7 years',
    ],
    correctAnswer: 2,
    explanation: 'Lok Sabha elections are held every 5 years, unless the parliament is dissolved earlier. The term of Lok Sabha members is also 5 years.',
    category: 'general_election',
    difficulty: 'beginner',
    language: 'en',
  },
];

type QuizState = 'setup' | 'quiz' | 'results';

export default function QuizPage() {
  const t = useTranslations();
  const [quizState, setQuizState] = useState<QuizState>('setup');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuizDifficulty>('beginner');
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>('general_election');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'te' | 'ta'>('en');
  const [answeredCurrent, setAnsweredCurrent] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

  const {
    currentSession,
    initializeQuiz,
    answerQuestion,
    nextQuestion,
    completeQuiz,
    resetQuiz,
    getCurrentQuestion,
    getProgress,
    getScore,
    calculateXP,
  } = useQuizStore();

  const { user } = useAuthStore();

  // Timer effect
  useEffect(() => {
    if (quizState !== 'quiz' || answeredCurrent) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const timerDuration = selectedDifficulty === 'exam' ? 30 : 60;

    if (timeRemaining <= 0) {
      // Auto-skip if time runs out in exam mode
      if (selectedDifficulty === 'exam') {
        toast.error('Time ran out! Moving to next question.');
        handleNextQuestion();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeRemaining, quizState, answeredCurrent, selectedDifficulty, getCurrentQuestion]);

  // Reset timer when question changes
  useEffect(() => {
    setTimeRemaining(selectedDifficulty === 'exam' ? 30 : 60);
  }, [currentSession?.currentQuestionIndex, selectedDifficulty]);

  const handleStartQuiz = async () => {
    setIsLoadingQuiz(true);
    try {
      // Try to fetch from API first
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/quiz/generate`,
        {
          params: {
            difficulty: selectedDifficulty,
            category: selectedCategory,
            language: selectedLanguage,
            count: 10,
          },
        }
      );

      const questions = response.data.questions || SAMPLE_QUESTIONS;
      initializeQuiz(selectedDifficulty, selectedCategory, selectedLanguage, questions);
    } catch (error) {
      // Fallback to sample questions
      console.log('Using fallback sample questions');
      initializeQuiz(selectedDifficulty, selectedCategory, selectedLanguage, SAMPLE_QUESTIONS);
    } finally {
      setIsLoadingQuiz(false);
      setQuizState('quiz');
      setAnsweredCurrent(false);
      setSelectedAnswerIndex(null);
      setTimeRemaining(selectedDifficulty === 'exam' ? 30 : 60);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (answeredCurrent) return;

    setSelectedAnswerIndex(index);
    const currentQuestion = getCurrentQuestion();
    if (currentQuestion) {
      answerQuestion(currentQuestion.id, index);
      setAnsweredCurrent(true);
    }
  };

  const handleNextQuestion = () => {
    const progress = getProgress();
    if (progress.current === progress.total) {
      completeQuiz();
      setQuizState('results');
    } else {
      nextQuestion();
      setAnsweredCurrent(false);
      setSelectedAnswerIndex(null);
      setTimeRemaining(selectedDifficulty === 'exam' ? 30 : 60);
    }
  };

  const handleNewQuiz = () => {
    resetQuiz();
    setQuizState('setup');
    setSelectedDifficulty('beginner');
    setSelectedCategory('general_election');
    setSelectedLanguage('en');
    setAnsweredCurrent(false);
    setSelectedAnswerIndex(null);
  };

  const handleShareScore = () => {
    if (!currentSession) return;
    const score = getScore();
    const xp = calculateXP();
    const text = `I scored ${score.correct}/${score.total} on CivicGuide AI Quiz (${currentSession.difficulty} mode) and earned ${xp} XP! 🎓🗳️ Join me in learning about Indian elections!`;
    
    if (navigator.share) {
      navigator.share({ title: 'CivicGuide Quiz Result', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Score copied to clipboard!');
    }
  };

  // Render confetti on high score
  useEffect(() => {
    if (quizState === 'results' && currentSession) {
      const score = getScore();
      const percentage = (score.correct / score.total) * 100;
      if (percentage >= 80) {
        // Create simple confetti effect using DOM
        createConfetti();
      }
    }
  }, [quizState]);

  const createConfetti = () => {
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * window.innerWidth + 'px';
      confetti.style.top = '-10px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = ['#FF9933', '#138808', '#000080', '#FFC500'][Math.floor(Math.random() * 4)];
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      document.body.appendChild(confetti);

      const duration = 3000 + Math.random() * 1000;
      const keyframes = `@keyframes fall-${i} { from { transform: translateY(0) rotate(0deg); opacity: 1; } to { transform: translateY(${window.innerHeight + 100}px) rotate(360deg); opacity: 0; } }`;
      const style = document.createElement('style');
      style.innerHTML = keyframes;
      document.head.appendChild(style);

      confetti.style.animation = `fall-${i} ${duration}ms linear forwards`;
      setTimeout(() => confetti.remove(), duration);
    }
  };

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const score = getScore();

  // ===================== SETUP SCREEN =====================
  if (quizState === 'setup' && !currentSession) {
    return (
      <div className="min-h-screen bg-gradient-civic-light py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="w-10 h-10 text-saffron" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-civic bg-clip-text text-transparent">
                Quiz Mode
              </h1>
            </div>
            <p className="text-lg text-gray-700">Test your knowledge of Indian elections and civics</p>
          </motion.div>

          {/* Quiz Setup Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Difficulty Selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Select Difficulty</h3>
                  <div className="space-y-3">
                    {['beginner', 'student', 'exam'].map((diff) => (
                      <motion.button
                        key={diff}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedDifficulty(diff as QuizDifficulty)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${
                          selectedDifficulty === diff
                            ? 'border-saffron bg-gradient-civic-light text-saffron'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="capitalize font-semibold">
                              {diff === 'beginner' ? '🎓 Beginner' : diff === 'student' ? '📚 Student' : '🏆 Exam Mode'}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {diff === 'beginner'
                                ? '60 seconds per question'
                                : diff === 'student'
                                ? '60 seconds per question'
                                : '30 seconds per question'}
                            </div>
                          </div>
                          <Clock className="w-5 h-5" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Category Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Filter className="w-5 h-5 text-india-green" />
                    Select Category
                  </h3>
                  <div className="space-y-3">
                    {[
                      { value: 'general_election', label: '🗳️ General Election' },
                      { value: 'constitution', label: '📜 Constitution' },
                      { value: 'voting_process', label: '🔄 Voting Process' },
                      { value: 'current_affairs', label: '📰 Current Affairs' },
                      { value: 'state_elections', label: '🏛️ State Elections' },
                    ].map((cat) => (
                      <motion.button
                        key={cat.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedCategory(cat.value as QuizCategory)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left font-medium ${
                          selectedCategory === cat.value
                            ? 'border-india-green bg-gradient-civic-light text-india-green'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {cat.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Language Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-8">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-navy" />
                  Select Language
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { code: 'en', label: '🇮🇳 English' },
                    { code: 'hi', label: '🇮🇳 हिंदी' },
                    { code: 'te', label: '🇮🇳 తెలుగు' },
                    { code: 'ta', label: '🇮🇳 தமிழ்' },
                  ].map((lang) => (
                    <motion.button
                      key={lang.code}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedLanguage(lang.code as any)}
                      className={`p-3 rounded-lg border-2 font-medium transition-all ${
                        selectedLanguage === lang.code
                          ? 'border-navy bg-gradient-civic-light text-navy'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {lang.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 justify-center"
          >
            <Button
              size="lg"
              variant="default"
              onClick={handleStartQuiz}
              disabled={isLoadingQuiz}
              className="gap-2"
            >
              {isLoadingQuiz ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Quiz
                </>
              )}
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/learn">Browse Resources</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===================== QUIZ SCREEN =====================
  if (quizState === 'quiz' && currentSession && currentQuestion) {
    const isCorrect = selectedAnswerIndex === currentQuestion.correctAnswer;
    const timerPercentage = (timeRemaining / (selectedDifficulty === 'exam' ? 30 : 60)) * 100;

    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header with Progress */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-civic rounded-lg flex items-center justify-center text-white font-bold">
                  CG
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">Question {progress.current}</h2>
                  <p className="text-sm text-gray-600">of {progress.total}</p>
                </div>
              </div>
              <Badge variant="default" className="text-lg px-4 py-2">
                Score: {score.correct}/{score.total}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-civic"
                initial={{ width: '0%' }}
                animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Timer Bar */}
          {selectedDifficulty === 'exam' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Time Remaining</span>
                <span className={`font-bold ${timeRemaining <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                  {timeRemaining}s
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-full ${
                    timeRemaining <= 10
                      ? 'bg-red-500'
                      : timeRemaining <= 20
                      ? 'bg-yellow-500'
                      : 'bg-india-green'
                  }`}
                  animate={{ width: `${timerPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {/* Question */}
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-8 bg-gradient-civic-light border-gray-200">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </h3>
            </Card>
          </motion.div>

          {/* Answer Options */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 mb-8"
          >
            {currentQuestion.options.map((option, idx) => {
              const isSelected = idx === selectedAnswerIndex;
              const isCorrectOption = idx === currentQuestion.correctAnswer;
              const showResult = answeredCurrent;

              let bgClass = 'bg-white border-gray-200 hover:border-saffron';
              if (showResult && isCorrectOption) {
                bgClass = 'bg-green-50 border-green-500 border-2';
              } else if (showResult && isSelected && !isCorrect) {
                bgClass = 'bg-red-50 border-red-500 border-2';
              }

              return (
                <motion.button
                  key={idx}
                  whileHover={!answeredCurrent ? { scale: 1.02 } : {}}
                  whileTap={!answeredCurrent ? { scale: 0.98 } : {}}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={answeredCurrent}
                  className={`w-full p-6 rounded-lg border-2 transition-all text-left font-medium disabled:cursor-not-allowed flex items-center justify-between ${bgClass}`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold mt-1 ${
                        isSelected
                          ? 'border-saffron bg-saffron text-white'
                          : 'border-gray-300 text-gray-400'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-lg text-gray-900">{option}</span>
                  </div>
                  {showResult && isCorrectOption && <span className="text-2xl">✓</span>}
                  {showResult && isSelected && !isCorrect && <span className="text-2xl">✗</span>}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Explanation */}
          <AnimatePresence>
            {answeredCurrent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-8 p-6 rounded-lg border-l-4 ${
                  isCorrect
                    ? 'bg-green-50 border-green-500 text-green-900'
                    : 'bg-red-50 border-red-500 text-red-900'
                }`}
              >
                <p className="font-semibold mb-2">{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
                <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            {answeredCurrent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full"
              >
                <Button
                  size="lg"
                  variant="default"
                  onClick={handleNextQuestion}
                  className="w-full gap-2"
                >
                  {progress.current === progress.total ? 'See Results' : 'Next Question'}
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===================== RESULTS SCREEN =====================
  if (quizState === 'results' && currentSession) {
    const percentage = (score.correct / score.total) * 100;
    const xp = calculateXP();
    const isHighScore = percentage >= 80;

    return (
      <div className="min-h-screen bg-gradient-civic-light py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Trophy / Success Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className="text-center mb-8"
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isHighScore ? 'bg-gradient-civic' : 'bg-gradient-to-br from-orange-200 to-yellow-200'
            }`}>
              <Trophy className={`w-12 h-12 ${isHighScore ? 'text-white' : 'text-yellow-700'}`} />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              {percentage >= 90 ? 'Outstanding!' : percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Learning!'}
            </h1>
            <p className="text-lg text-gray-700">Quiz Completed</p>
          </motion.div>

          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="mb-8 p-8 bg-white border-2 border-saffron/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {/* Score */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">SCORE</p>
                  <p className="text-4xl font-bold bg-gradient-civic bg-clip-text text-transparent">
                    {score.correct}/{score.total}
                  </p>
                </div>

                {/* Percentage */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">PERCENTAGE</p>
                  <p className="text-4xl font-bold text-india-green">{Math.round(percentage)}%</p>
                </div>

                {/* XP Earned */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2 flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4" /> XP EARNED
                  </p>
                  <p className="text-4xl font-bold text-saffron">+{xp}</p>
                </div>

                {/* Difficulty Badge */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">DIFFICULTY</p>
                  <Badge
                    variant={
                      currentSession.difficulty === 'exam'
                        ? 'default'
                        : currentSession.difficulty === 'student'
                        ? 'warning'
                        : 'success'
                    }
                    className="justify-center"
                  >
                    {currentSession.difficulty.charAt(0).toUpperCase() + currentSession.difficulty.slice(1)}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Category & Language Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="font-bold text-gray-900 capitalize">
                {currentSession.category.replace(/_/g, ' ')}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Language</p>
              <p className="font-bold text-gray-900">
                {currentSession.language === 'en'
                  ? 'English'
                  : currentSession.language === 'hi'
                  ? 'हिंदी'
                  : currentSession.language === 'te'
                  ? 'తెలుగు'
                  : 'தமிழ்'}
              </p>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 mb-8"
          >
            <Button
              size="lg"
              variant="default"
              onClick={handleShareScore}
              className="w-full gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Score
            </Button>

            <div className="grid md:grid-cols-2 gap-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={handleNewQuiz}
                className="gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                New Quiz
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
              >
                <Link href="/learn">More Resources</Link>
              </Button>
            </div>
          </motion.div>

          {/* Encouragement Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-white rounded-lg border-l-4 border-india-green text-center"
          >
            {percentage >= 80 ? (
              <>
                <p className="font-semibold text-gray-900 mb-2">🎉 Great Job!</p>
                <p className="text-gray-700 text-sm">
                  You've earned {xp} XP! Keep up this momentum and explore more topics to become a civic expert.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-900 mb-2">Keep Learning!</p>
                <p className="text-gray-700 text-sm">
                  Review the materials and try again to improve your score. Every attempt helps you learn!
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
