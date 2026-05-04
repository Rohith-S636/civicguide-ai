'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function AppBootstrap() {
  const ensureGuestSession = useAuthStore((state) => state.ensureGuestSession);

  useEffect(() => {
    ensureGuestSession();
  }, [ensureGuestSession]);

  return null;
}

export default AppBootstrap;
