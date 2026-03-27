'use client';

import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  const selected = value ? parseISO(value) : undefined;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex h-9 w-full items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <CalendarDays size={14} className="text-gray-400" />
          {value ? (
            <span className="text-gray-700">{format(parseISO(value), 'MMM d, yyyy')}</span>
          ) : (
            <span className="text-gray-400">No due date</span>
          )}
          {value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 rounded-md border border-gray-200 bg-white shadow-lg"
          sideOffset={4}
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(day) => onChange(day ? format(day, 'yyyy-MM-dd') : null)}
            className="p-2"
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
