'use client';

import useSWR from 'swr';
import type { DatabaseSchema } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSchema() {
  const { data, error, isLoading } = useSWR<DatabaseSchema>(
    '/api/schema',
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    schema: data,
    isLoading,
    error: error?.message ?? (data as { error?: string } | undefined)?.error,
  };
}
