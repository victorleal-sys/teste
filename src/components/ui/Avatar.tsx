import type { NotionUser } from '@/lib/types';

const COLORS = [
  'bg-red-400',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-green-400',
  'bg-blue-400',
  'bg-purple-400',
  'bg-pink-400',
];

function colorForId(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface AvatarProps {
  user: NotionUser;
  size?: 'sm' | 'md';
}

export function Avatar({ user, size = 'sm' }: AvatarProps) {
  const dim = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  const initials = (user.name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatarUrl}
        alt={user.name ?? 'User'}
        title={user.name ?? undefined}
        className={`${dim} rounded-full object-cover ring-2 ring-white`}
      />
    );
  }

  return (
    <div
      title={user.name ?? undefined}
      className={`${dim} ${colorForId(user.id)} rounded-full flex items-center justify-center ring-2 ring-white text-white font-semibold`}
    >
      {initials}
    </div>
  );
}
