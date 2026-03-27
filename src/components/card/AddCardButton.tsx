'use client';

import { Plus } from 'lucide-react';

export function AddCardButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
    >
      <Plus size={14} />
      Add card
    </button>
  );
}
