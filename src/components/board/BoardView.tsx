'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { useState, useCallback } from 'react';
import { Column } from './Column';
import { Card } from '@/components/card/Card';
import { CardModal } from '@/components/card/CardModal';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { useBoard } from '@/hooks/useBoard';
import { useSchema } from '@/hooks/useSchema';
import { useCardMutations } from '@/hooks/useCardMutations';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import type { CardData } from '@/lib/types';

export function BoardView() {
  const { board, isLoading, error: boardError, mutate } = useBoard();
  const { schema, error: schemaError } = useSchema();

  const revalidate = useCallback(() => mutate(), [mutate]);
  const { updateCard, createCard, deleteCard } = useCardMutations(revalidate);

  const { activeCard, handleDragStart, handleDragEnd } = useDragAndDrop({
    board,
    mutate,
    updateCard,
  });

  const [modalState, setModalState] = useState<
    | { mode: 'create'; columnId: string }
    | { mode: 'edit'; card: CardData }
    | null
  >(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const error = boardError ?? schemaError;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-lg">
        <ErrorBanner message={error} />
      </div>
    );
  }

  if (!board) return null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto px-6 py-4 pb-8">
          {board.columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              onAddCard={(columnId) =>
                setModalState({ mode: 'create', columnId })
              }
              onEditCard={(cardId) => {
                const card = board.columns
                  .flatMap((c) => c.cards)
                  .find((c) => c.id === cardId);
                if (card) setModalState({ mode: 'edit', card });
              }}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard && (
            <Card card={activeCard} onClick={() => {}} isDragging />
          )}
        </DragOverlay>
      </DndContext>

      {modalState && (
        <CardModal
          mode={modalState.mode}
          card={modalState.mode === 'edit' ? modalState.card : undefined}
          initialColumnId={
            modalState.mode === 'create' ? modalState.columnId : undefined
          }
          schema={schema}
          columns={board.columns}
          onClose={() => setModalState(null)}
          onCreate={createCard}
          onUpdate={updateCard}
          onDelete={deleteCard}
        />
      )}
    </>
  );
}
