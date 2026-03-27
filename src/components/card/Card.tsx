'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink } from 'lucide-react';
import { CardBadges } from './CardBadges';
import type { CardData } from '@/lib/types';
import clsx from 'clsx';

interface CardProps {
  card: CardData;
  onClick: () => void;
  isDragging?: boolean;
}

export function Card({ card, onClick, isDragging }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        'group cursor-grab rounded-lg bg-white px-3 py-2.5 shadow-sm ring-1 ring-gray-200 transition-shadow',
        'hover:shadow-md hover:ring-gray-300',
        (isSortableDragging || isDragging) && 'opacity-50 shadow-lg ring-blue-300',
        isDragging && 'rotate-1 cursor-grabbing shadow-xl'
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="flex-1 text-left text-sm font-medium text-gray-800 hover:text-blue-600"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {card.title || <span className="text-gray-400 italic">Untitled</span>}
        </button>
        <a
          href={card.notionUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="shrink-0 rounded p-0.5 text-gray-300 opacity-0 transition-opacity hover:text-gray-500 group-hover:opacity-100"
          aria-label="Open in Notion"
        >
          <ExternalLink size={12} />
        </a>
      </div>
      <CardBadges card={card} />
    </div>
  );
}
