import clsx from 'clsx';

const notionColorMap: Record<string, string> = {
  red: 'bg-red-100 text-red-700',
  orange: 'bg-orange-100 text-orange-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  green: 'bg-green-100 text-green-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  pink: 'bg-pink-100 text-pink-700',
  brown: 'bg-amber-100 text-amber-800',
  gray: 'bg-gray-100 text-gray-600',
  default: 'bg-gray-100 text-gray-600',
};

interface BadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export function Badge({ label, color = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        notionColorMap[color] ?? notionColorMap.default,
        className
      )}
    >
      {label}
    </span>
  );
}

export { notionColorMap };
