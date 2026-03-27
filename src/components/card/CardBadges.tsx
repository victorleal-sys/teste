import { format, parseISO, isPast } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import type { CardData } from '@/lib/types';
import clsx from 'clsx';

export function CardBadges({ card }: { card: CardData }) {
  const hasAny =
    card.priority ||
    card.labels.length > 0 ||
    card.dueDate ||
    card.assignees.length > 0;

  if (!hasAny) return null;

  const overdue = card.dueDate ? isPast(parseISO(card.dueDate)) : false;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      {card.priority && (
        <Badge label={card.priority.name} color={card.priority.color} />
      )}
      {card.labels.map((l) => (
        <Badge key={l.id} label={l.name} color={l.color} />
      ))}
      {card.dueDate && (
        <span
          className={clsx(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            overdue
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-500'
          )}
        >
          <Calendar size={10} />
          {format(parseISO(card.dueDate), 'MMM d')}
        </span>
      )}
      {card.assignees.length > 0 && (
        <div className="ml-auto flex -space-x-1">
          {card.assignees.slice(0, 3).map((u) => (
            <Avatar key={u.id} user={u} size="sm" />
          ))}
          {card.assignees.length > 3 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600 ring-2 ring-white">
              +{card.assignees.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
