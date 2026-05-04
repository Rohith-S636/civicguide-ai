'use client';

import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/api';

export interface ApiErrorResponse {
  detail?: string;
  error?: string;
  message?: string;
}

export function useApiQuery<T>(
  queryKey: readonly unknown[],
  url: string,
  options?: UseQueryOptions<T, AxiosError<ApiErrorResponse>>
): UseQueryResult<T, AxiosError<ApiErrorResponse>> {
  return useQuery<T, AxiosError<ApiErrorResponse>>({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<T>(url);
      return data;
    },
    ...options,
  });
}

export function useApiMutation<T = void, D = unknown>(
  method: 'post' | 'put' | 'patch' | 'delete',
  url: string
): UseMutationResult<T, AxiosError<ApiErrorResponse>, D> {
  return useMutation<T, AxiosError<ApiErrorResponse>, D>({
    mutationFn: async (data) => {
      const { data: response } = await apiClient[method]<T>(url, data);
      return response;
    },
  });
}

export function usePostMutation<T = void, D = unknown>(
  url: string
): UseMutationResult<T, AxiosError<ApiErrorResponse>, D> {
  return useApiMutation<T, D>('post', url);
}

export function usePutMutation<T = void, D = unknown>(
  url: string
): UseMutationResult<T, AxiosError<ApiErrorResponse>, D> {
  return useApiMutation<T, D>('put', url);
}

export function useDeleteMutation<T = void, D = unknown>(
  url: string
): UseMutationResult<T, AxiosError<ApiErrorResponse>, D> {
  return useApiMutation<T, D>('delete', url);
}
