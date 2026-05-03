import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API service methods
export const api = {
  // Chat APIs
  chat: {
    sendMessage: (message: string) =>
      apiClient.post('/api/chat/message', { message }),
    getHistory: () =>
      apiClient.get('/api/chat/history'),
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
    getLatest: (limit: number = 10) =>
      apiClient.get(`/api/news/latest?limit=${limit}`),
    searchNews: (query: string, limit: number = 10) =>
      apiClient.get(`/api/news/search?q=${query}&limit=${limit}`),
  },

  // User APIs
  user: {
    getProfile: () =>
      apiClient.get('/api/users/profile'),
    updateProfile: (data: Record<string, any>) =>
      apiClient.put('/api/users/profile', data),
    getLeaderboard: (limit: number = 10) =>
      apiClient.get(`/api/users/leaderboard?limit=${limit}`),
  },

  // Forms APIs
  forms: {
    getForms: () =>
      apiClient.get('/api/forms/forms'),
    getFormProcess: (formId: string) =>
      apiClient.get(`/api/forms/process/${formId}`),
  },
};

export default apiClient;
