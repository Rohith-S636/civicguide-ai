"use client";

import { useTranslations } from 'next-intl';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Volume2, Check, X } from 'lucide-react';
import { useState } from 'react';

export default function QuizPage() {
  const t = useTranslations();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = {
    id: '1',
    question: 'What is the minimum age to vote in Indian elections?',
    options: ['16 years', '18 years', '21 years', '25 years'],
    correctAnswer: '18 years',
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
  };

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <PageWrapper
      title="Quiz Mode"
      description="Test your knowledge on Indian elections and civics"
      breadcrumbs={[{ label: 'Learn', href: '/learn' }, { label: 'Quiz' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">Question 1 of 5</span>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-saffron h-2 rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h2 className="text-2xl font-semibold mb-6 text-gray-900">{currentQuestion.question}</h2>

              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${selectedAnswer === option ? (isCorrect ? 'border-india-green bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-200 hover:border-saffron'} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{option}</span>
                      {showResult && (
                        <>
                          {option === currentQuestion.correctAnswer && <Check className="w-5 h-5 text-india-green" />}
                          {selectedAnswer === option && !isCorrect && <X className="w-5 h-5 text-red-500" />}
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {showResult && (
                <div className={`p-4 rounded-lg mb-6 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-semibold ${isCorrect ? 'text-india-green' : 'text-red-600'}`}>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
                  <p className="text-sm text-gray-700 mt-2">The minimum age to vote in India is 18 years. You must be an Indian citizen and a registered voter to participate in elections.</p>
                  <p className="text-sm font-semibold text-gray-900 mt-3">+50 XP earned!</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="gap-2"><Volume2 className="w-4 h-4" />Read Aloud</Button>
                {showResult && (
                  <Button variant="default" className="ml-auto gap-2"><RefreshCw className="w-4 h-4" />Next Question</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quiz Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
                <p className="text-2xl font-bold text-india-green">4/5</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Time Spent</p>
                <p className="text-2xl font-bold text-saffron">2:45</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Estimated Score</p>
                <p className="text-2xl font-bold text-navy">80%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Difficulty Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">Easy</Button>
                <Button variant="default" size="sm" className="w-full bg-saffron">Medium</Button>
                <Button variant="outline" size="sm" className="w-full">Hard</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
