'use client';

import { useCallback, useState } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { BoardData, CardData } from '@/lib/types';
import type { KeyedMutator } from 'swr';

interface UseDragAndDropOptions {
  board: BoardData | undefined;
  mutate: KeyedMutator<BoardData>;
  updateCard: (id: string, payload: { status: string }) => Promise<void>;
}

export function useDragAndDrop({ board, mutate, updateCard }: UseDragAndDropOptions) {
  const [activeCard, setActiveCard] = useState<CardData | null>(null);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      if (!board) return;
      for (const col of board.columns) {
        const card = col.cards.find((c) => c.id === active.id);
        if (card) {
          setActiveCard(card);
          return;
        }
      }
    },
    [board]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveCard(null);
      const { active, over } = event;
      if (!over || !board) return;

      const cardId = active.id as string;
      // over.id can be a column id (dropping on empty column) or another card id
      let targetColumnId = over.id as string;

      // If dropped on a card, find its column
      const isCard = board.columns.some((col) =>
        col.cards.some((c) => c.id === targetColumnId)
      );
      if (isCard) {
        const col = board.columns.find((col) =>
          col.cards.some((c) => c.id === targetColumnId)
        );
        targetColumnId = col?.id ?? targetColumnId;
      }

      // Find source column
      const sourceColumn = board.columns.find((col) =>
        col.cards.some((c) => c.id === cardId)
      );
      if (!sourceColumn || sourceColumn.id === targetColumnId) return;

      // Optimistic update
      mutate(
        (current) => {
          if (!current) return current;
          const columns = current.columns.map((col) => {
            if (col.id === sourceColumn.id) {
              return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
            }
            if (col.id === targetColumnId) {
              const movedCard = sourceColumn.cards.find((c) => c.id === cardId)!;
              return { ...col, cards: [...col.cards, { ...movedCard, status: targetColumnId }] };
            }
            return col;
          });
          return { columns };
        },
        { revalidate: false }
      );

      await updateCard(cardId, { status: targetColumnId });
      // Revalidate after server confirms
      mutate();
    },
    [board, mutate, updateCard]
  );

  return { activeCard, handleDragStart, handleDragEnd };
}
