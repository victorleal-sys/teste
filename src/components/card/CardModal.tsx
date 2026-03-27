'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { PrioritySelect } from '@/components/ui/PrioritySelect';
import { UserSelect } from '@/components/ui/UserSelect';
import { DatePicker } from '@/components/ui/DatePicker';
import { Trash2, ExternalLink } from 'lucide-react';
import type {
  CardData,
  CardCreatePayload,
  CardUpdatePayload,
  ColumnData,
  DatabaseSchema,
} from '@/lib/types';

interface CardModalProps {
  mode: 'create' | 'edit';
  card?: CardData;
  initialColumnId?: string;
  schema: DatabaseSchema | undefined;
  columns: ColumnData[];
  onClose: () => void;
  onCreate: (payload: CardCreatePayload) => Promise<void>;
  onUpdate: (id: string, payload: CardUpdatePayload) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CardModal({
  mode,
  card,
  initialColumnId,
  schema,
  columns,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: CardModalProps) {
  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [status, setStatus] = useState(card?.status ?? initialColumnId ?? '');
  const [assignees, setAssignees] = useState<string[]>(
    card?.assignees.map((u) => u.id) ?? []
  );
  const [dueDate, setDueDate] = useState<string | null>(card?.dueDate ?? null);
  const [labels, setLabels] = useState<string[]>(
    card?.labels.map((l) => l.name) ?? []
  );
  const [priority, setPriority] = useState<string | null>(
    card?.priority?.name ?? null
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload = { title, description, status, assignees, dueDate, labels, priority };
      if (mode === 'create') {
        await onCreate(payload as CardCreatePayload);
      } else if (card) {
        await onUpdate(card.id, payload as CardUpdatePayload);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!card) return;
    setDeleting(true);
    try {
      await onDelete(card.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      open
      onOpenChange={(open) => { if (!open) onClose(); }}
      title={mode === 'create' ? 'New Card' : 'Edit Card'}
    >
      <div className="flex flex-col gap-4">
        {/* Title */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Card title..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={3}
            className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Status (column) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.title}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Priority</label>
            <PrioritySelect
              options={schema?.priorityOptions ?? []}
              value={priority}
              onChange={setPriority}
            />
          </div>
        </div>

        {/* Labels */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Labels</label>
          <MultiSelect
            options={schema?.labelOptions ?? []}
            value={labels}
            onChange={setLabels}
            placeholder="Add labels..."
          />
        </div>

        {/* Assignees */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Assignees</label>
          <UserSelect
            users={schema?.workspaceUsers ?? []}
            value={assignees}
            onChange={setAssignees}
          />
        </div>

        {/* Due date */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Due date</label>
          <DatePicker value={dueDate} onChange={setDueDate} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex gap-2">
            {mode === 'edit' && card && (
              <>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <a
                  href={card.notionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
                >
                  <ExternalLink size={14} />
                  Open in Notion
                </a>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
