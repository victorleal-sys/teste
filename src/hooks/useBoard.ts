'use client';

import useSWR from 'swr';
import type { BoardData } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useBoard() {
  const { data, error, isLoading, mutate } = useSWR<BoardData>(
    '/api/board',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    board: data,
    isLoading,
    error: error?.message ?? (data as { error?: string } | undefined)?.error,
    mutate,
  };
}
