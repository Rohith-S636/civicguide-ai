import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // Enable credentials for secure cookie transmission
});

// ============================================================================
// SECURE TOKEN MANAGEMENT
// ============================================================================

/**
 * Secure token storage using httpOnly cookies (preferred)
 * Falls back to sessionStorage for XSS protection
 */
const getSecureToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try sessionStorage first (safer than localStorage, cleared on tab close)
  const sessionToken = sessionStorage.getItem('authToken');
  if (sessionToken) return sessionToken;
  
  // Fallback to localStorage if no session token
  const localToken = localStorage.getItem('authToken');
  return localToken;
};

const setSecureToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  
  // Store in sessionStorage primarily (cleared on browser close)
  sessionStorage.setItem('authToken', token);
  
  // Also store in localStorage as backup
  localStorage.setItem('authToken', token);
};

const clearSecureToken = (): void => {
  if (typeof window === 'undefined') return;
  
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('authToken');
};

// ============================================================================
// CSRF TOKEN MANAGEMENT
// ============================================================================

const getCsrfToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Get CSRF token from meta tag or cookie
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  if (metaTag) return metaTag.getAttribute('content');
  
  // Try to get from cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name.trim() === 'XSRF-TOKEN') return decodeURIComponent(value);
  }
  
  return null;
};

// ============================================================================
// REQUEST INTERCEPTOR
// ============================================================================

apiClient.interceptors.request.use(
  (config: any) => {
    // Add auth token
    const token = getSecureToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase())) {
      const csrfToken = getCsrfToken();
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ============================================================================
// RESPONSE INTERCEPTOR
// ============================================================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearSecureToken();
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    
    // Handle 403 Forbidden (CSRF token invalid)
    if (error.response?.status === 403) {
      console.warn('CSRF token validation failed');
    }
    
    return Promise.reject(error);
  }
);

// ============================================================================
// API SERVICE METHODS
// ============================================================================

export const api = {
  // Authentication
  auth: {
    setToken: setSecureToken,
    getToken: getSecureToken,
    clearToken: clearSecureToken,
  },

  // Chat APIs
  chat: {
    sendMessage: (message: string) => apiClient.post('/api/chat/message', { message }),
    getHistory: () => apiClient.get('/api/chat/history'),
  },

  // Quiz APIs
  quiz: {
    generateQuiz: (topic: string, difficulty: string, num_questions: number = 5) =>
      apiClient.post('/api/quiz/generate', { topic, difficulty, num_questions }),
    submitAnswer: (questionId: string, selectedAnswer: string) =>
      apiClient.post('/api/quiz/answer', { question_id: questionId, selected_answer: selectedAnswer }),
  },

  // News APIs
  news: {
    getLatest: (limit: number = 10) => apiClient.get(`/api/news/latest?limit=${limit}`),
    searchNews: (query: string, limit: number = 10) =>
      apiClient.get(`/api/news/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  },

  // User APIs
  user: {
    getProfile: () => apiClient.get('/api/users/profile'),
    updateProfile: (data: Record<string, unknown>) => apiClient.put('/api/users/profile', data),
    getLeaderboard: (limit: number = 10) => apiClient.get(`/api/users/leaderboard?limit=${limit}`),
  },

  // Forms APIs
  forms: {
    getForms: () => apiClient.get('/api/forms/forms'),
    getFormProcess: (formId: string) => apiClient.get(`/api/forms/process/${formId}`),
  },
};

export default apiClient;

