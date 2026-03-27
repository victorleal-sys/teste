'use client';

import * as Select from '@radix-ui/react-select';
import { ChevronDown } from 'lucide-react';
import { Badge } from './Badge';
import type { Label } from '@/lib/types';

interface PrioritySelectProps {
  options: Label[];
  value: string | null;
  onChange: (name: string | null) => void;
}

export function PrioritySelect({ options, value, onChange }: PrioritySelectProps) {
  return (
    <Select.Root
      value={value ?? '__none__'}
      onValueChange={(v) => onChange(v === '__none__' ? null : v)}
    >
      <Select.Trigger className="flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <Select.Value>
          {value ? (
            <Badge
              label={value}
              color={options.find((o) => o.name === value)?.color ?? 'default'}
            />
          ) : (
            <span className="text-gray-400">No priority</span>
          )}
        </Select.Value>
        <Select.Icon>
          <ChevronDown size={14} className="text-gray-400" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-50 rounded-md border border-gray-200 bg-white shadow-lg">
          <Select.Viewport className="py-1">
            <Select.Item
              value="__none__"
              className="flex cursor-pointer items-center px-3 py-2 text-sm outline-none hover:bg-gray-50"
            >
              <Select.ItemText>
                <span className="text-gray-400">No priority</span>
              </Select.ItemText>
            </Select.Item>
            {options.map((opt) => (
              <Select.Item
                key={opt.id}
                value={opt.name}
                className="flex cursor-pointer items-center px-3 py-2 text-sm outline-none hover:bg-gray-50"
              >
                <Select.ItemText>
                  <Badge label={opt.name} color={opt.color} />
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
