'use client';

import { useCallback } from 'react';
import type { CardCreatePayload, CardUpdatePayload } from '@/lib/types';

export function useCardMutations(onSettled?: () => void) {
  const updateCard = useCallback(
    async (id: string, payload: CardUpdatePayload) => {
      await fetch(`/api/cards/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      onSettled?.();
    },
    [onSettled]
  );

  const createCard = useCallback(
    async (payload: CardCreatePayload) => {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? 'Failed to create card');
      }
      onSettled?.();
    },
    [onSettled]
  );

  const deleteCard = useCallback(
    async (id: string) => {
      await fetch(`/api/cards/${id}`, { method: 'DELETE' });
      onSettled?.();
    },
    [onSettled]
  );

  return { updateCard, createCard, deleteCard };
}
