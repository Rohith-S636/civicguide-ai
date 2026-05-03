'use client';

import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { AxiosError } from 'axios';

export function useApiQuery<T>(
  queryKey: string[],
  url: string,
  options = {}
): UseQueryResult<T, AxiosError> {
  return useQuery<T, AxiosError>({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<T>(url);
      return data;
    },
    ...options,
  });
}

export function useApiMutation<T = void, D = any>(
  method: 'post' | 'put' | 'patch' | 'delete',
  url: string
): UseMutationResult<T, AxiosError, D> {
  return useMutation<T, AxiosError, D>({
    mutationFn: async (data) => {
      const { data: response } = await apiClient[method]<T>(url, data);
      return response;
    },
  });
}

export function usePostMutation<T = void, D = any>(
  url: string
): UseMutationResult<T, AxiosError, D> {
  return useApiMutation<T, D>('post', url);
}

export function usePutMutation<T = void, D = any>(
  url: string
): UseMutationResult<T, AxiosError, D> {
  return useApiMutation<T, D>('put', url);
}

export function useDeleteMutation<T = void, D = any>(
  url: string
): UseMutationResult<T, AxiosError, D> {
  return useApiMutation<T, D>('delete', url);
}
