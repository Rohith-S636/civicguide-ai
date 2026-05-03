'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

export function useNotification() {
  const success = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const error = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const info = useCallback((message: string) => {
    toast.info(message);
  }, []);

  const loading = useCallback((message: string) => {
    toast.loading(message);
  }, []);

  return { success, error, info, loading };
}
