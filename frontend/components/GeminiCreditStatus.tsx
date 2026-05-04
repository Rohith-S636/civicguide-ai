'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CreditStatus {
  requests_used: number;
  requests_limit: number;
  usage_percent: number;
  is_over_limit: boolean;
  is_warning: boolean;
  current_month: string;
  reset_date: string;
  status_message: string;
}

export default function GeminiCreditStatus() {
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCreditStatus = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/credit-status`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch credit status');
        }

        const data = await response.json();
        
        if (data.success) {
          setCreditStatus(data.data);
        } else {
          setError('Could not load credit information');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching credits');
        console.error('Credit status error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditStatus();

    // Refresh every 5 minutes
    const interval = setInterval(fetchCreditStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!creditStatus) {
    return null; // Don't show if no data available
  }

  // Determine color based on status
  const getColorClass = () => {
    if (creditStatus.is_over_limit) {
      return 'bg-red-50 border-red-200';
    }
    if (creditStatus.is_warning) {
      return 'bg-yellow-50 border-yellow-200';
    }
    return 'bg-green-50 border-green-200';
  };

  const getIconComponent = () => {
    if (creditStatus.is_over_limit) {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    if (creditStatus.is_warning) {
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
    return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  };

  const getTextColor = () => {
    if (creditStatus.is_over_limit) {
      return 'text-red-700';
    }
    if (creditStatus.is_warning) {
      return 'text-yellow-700';
    }
    return 'text-green-700';
  };

  const getProgressBarColor = () => {
    if (creditStatus.is_over_limit) {
      return 'bg-red-500';
    }
    if (creditStatus.is_warning) {
      return 'bg-yellow-500';
    }
    return 'bg-green-500';
  };

  return (
    <Card className={`border ${getColorClass()} shadow-sm`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIconComponent()}
            <CardTitle className="text-sm font-semibold">
              AI API Credits ({creditStatus.current_month})
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={creditStatus.is_over_limit ? 'bg-red-100 text-red-800' : creditStatus.is_warning ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}
          >
            {creditStatus.requests_used} / {creditStatus.requests_limit}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className={getTextColor()}>
              {creditStatus.usage_percent.toFixed(1)}% Used
            </span>
            <span className="text-slate-600">
              Resets: {creditStatus.reset_date}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProgressBarColor()}`}
              style={{ width: `${Math.min(creditStatus.usage_percent, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        <p className={`text-xs ${getTextColor()}`}>
          {creditStatus.status_message}
        </p>

        {/* Additional Info */}
        <div className="bg-white/50 rounded p-2 text-xs text-slate-600 space-y-1">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>
              Powered by{' '}
              <a
                href="https://makersuite.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-semibold"
              >
                Google Gemini
              </a>
              . Free tier: 60 requests/minute.
            </span>
          </div>
        </div>

        {/* Over Limit Message */}
        {creditStatus.is_over_limit && (
          <div className="bg-red-100/50 rounded p-2 text-xs text-red-700 font-semibold">
            ⚠️ Your free tier limit has been reached. Service will resume on {creditStatus.reset_date}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
