'use client';

import * as Popover from '@radix-ui/react-popover';
import { Check, Users } from 'lucide-react';
import { Avatar } from './Avatar';
import type { NotionUser } from '@/lib/types';

interface UserSelectProps {
  users: NotionUser[];
  value: string[]; // user IDs
  onChange: (ids: string[]) => void;
}

export function UserSelect({ users, value, onChange }: UserSelectProps) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selected = users.filter((u) => value.includes(u.id));

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="flex min-h-9 w-full items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
          {selected.length === 0 ? (
            <>
              <Users size={14} className="text-gray-400" />
              <span className="text-gray-400">Assign members...</span>
            </>
          ) : (
            <div className="flex -space-x-1">
              {selected.map((u) => (
                <Avatar key={u.id} user={u} />
              ))}
            </div>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-60 rounded-md border border-gray-200 bg-white shadow-lg"
          sideOffset={4}
        >
          <div className="max-h-56 overflow-y-auto py-1">
            {users.map((user) => {
              const isSelected = value.includes(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => toggle(user.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <span className={`${isSelected ? 'text-blue-500' : 'text-transparent'}`}>
                    <Check size={14} />
                  </span>
                  <Avatar user={user} />
                  <span className="truncate text-gray-700">{user.name ?? 'Unknown'}</span>
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
