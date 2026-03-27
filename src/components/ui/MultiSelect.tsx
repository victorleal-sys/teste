'use client';

import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown } from 'lucide-react';
import { Badge } from './Badge';
import type { Label } from '@/lib/types';

interface MultiSelectProps {
  options: Label[];
  value: string[]; // selected option names
  onChange: (names: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
}: MultiSelectProps) {
  const toggle = (name: string) => {
    if (value.includes(name)) {
      onChange(value.filter((v) => v !== name));
    } else {
      onChange([...value, name]);
    }
  };

  const selectedLabels = options.filter((o) => value.includes(o.name));

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {selectedLabels.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            selectedLabels.map((l) => (
              <Badge key={l.id} label={l.name} color={l.color} />
            ))
          )}
          <ChevronDown size={14} className="ml-auto shrink-0 text-gray-400" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-56 rounded-md border border-gray-200 bg-white shadow-lg"
          sideOffset={4}
        >
          <div className="max-h-56 overflow-y-auto py-1">
            {options.map((opt) => {
              const selected = value.includes(opt.name);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggle(opt.name)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <span className={`h-4 w-4 ${selected ? 'text-blue-500' : 'text-transparent'}`}>
                    <Check size={14} />
                  </span>
                  <Badge label={opt.name} color={opt.color} />
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
