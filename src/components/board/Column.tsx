'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ColumnHeader } from './ColumnHeader';
import { Card } from '@/components/card/Card';
import { AddCardButton } from '@/components/card/AddCardButton';
import type { ColumnData } from '@/lib/types';
import clsx from 'clsx';

interface ColumnProps {
  column: ColumnData;
  onAddCard: (columnId: string) => void;
  onEditCard: (cardId: string) => void;
}

export function Column({ column, onAddCard, onEditCard }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-gray-50 shadow-sm">
      <ColumnHeader title={column.title} color={column.color} count={column.cards.length} />

      <div
        ref={setNodeRef}
        className={clsx(
          'flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2 transition-colors',
          isOver && 'bg-blue-50'
        )}
        style={{ minHeight: 60 }}
      >
        <SortableContext
          items={column.cards.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <Card key={card.id} card={card} onClick={() => onEditCard(card.id)} />
          ))}
        </SortableContext>
      </div>

      <div className="px-2 pb-2">
        <AddCardButton onClick={() => onAddCard(column.id)} />
      </div>
    </div>
  );
}
