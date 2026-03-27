import clsx from 'clsx';

const accentMap: Record<string, string> = {
  red: 'bg-red-400',
  orange: 'bg-orange-400',
  yellow: 'bg-yellow-400',
  green: 'bg-green-400',
  blue: 'bg-blue-400',
  purple: 'bg-purple-400',
  pink: 'bg-pink-400',
  brown: 'bg-amber-600',
  gray: 'bg-gray-400',
  default: 'bg-slate-400',
};

interface ColumnHeaderProps {
  title: string;
  color: string;
  count: number;
}

export function ColumnHeader({ title, color, count }: ColumnHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-3 pb-3 pt-4">
      <div
        className={clsx(
          'h-2.5 w-2.5 rounded-full',
          accentMap[color] ?? accentMap.default
        )}
      />
      <h3 className="flex-1 truncate text-sm font-semibold text-gray-700">{title}</h3>
      <span className="min-w-[20px] rounded-full bg-gray-100 px-1.5 py-0.5 text-center text-xs font-medium text-gray-500">
        {count}
      </span>
    </div>
  );
}
