'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

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
    let cancelled = false;

    const fetchCreditStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/credit-status`, {
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch credit status');
        }

        const data: { success?: boolean; data?: CreditStatus; error?: string } = await response.json();

        if (!cancelled) {
          if (data.success && data.data) {
            setCreditStatus(data.data);
          } else {
            throw new Error(data.error || 'Could not load credit information');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error fetching credits');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCreditStatus();

    const interval = setInterval(fetchCreditStatus, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border border-amber-200 bg-amber-50 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-700" />
            <CardTitle className="text-sm font-semibold text-amber-900">
              AI API Credits unavailable
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-amber-800">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-white px-3 py-2 text-xs font-medium text-amber-900 hover:bg-amber-100"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!creditStatus) {
    return null;
  }

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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {getIconComponent()}
            <CardTitle className="text-sm font-semibold">
              AI API Credits ({creditStatus.current_month})
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={creditStatus.is_over_limit ? 'border-red-300 text-red-800' : creditStatus.is_warning ? 'border-yellow-300 text-yellow-800' : 'border-green-300 text-green-800'}
          >
            {creditStatus.requests_used} / {creditStatus.requests_limit}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-xs gap-3">
            <span className={getTextColor()}>
              {creditStatus.usage_percent.toFixed(1)}% Used
            </span>
            <span className="text-slate-600 text-right">
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

        <p className={`text-xs ${getTextColor()}`}>
          {creditStatus.status_message}
        </p>

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

        {creditStatus.is_over_limit && (
          <div className="bg-red-100/50 rounded p-2 text-xs text-red-700 font-semibold">
            ⚠️ Your free tier limit has been reached. Service will resume on {creditStatus.reset_date}.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
