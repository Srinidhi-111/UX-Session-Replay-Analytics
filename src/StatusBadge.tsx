interface StatusBadgeProps {
  status: string;
}

const styles: Record<string, string> = {
  RAGE_CLICK:
    'bg-orange-500/15 text-orange-400 ring-1 ring-inset ring-orange-500/30 shadow-[0_0_12px_-3px_rgba(249,115,22,0.5)]',
  ABANDONED:
    'bg-red-500/15 text-red-400 ring-1 ring-inset ring-red-500/30 shadow-[0_0_12px_-3px_rgba(239,68,68,0.5)]',
  CONVERTED:
    'bg-green-500/15 text-green-400 ring-1 ring-inset ring-green-500/30 shadow-[0_0_12px_-3px_rgba(34,197,94,0.5)]',
  NORMAL: 'bg-gray-500/15 text-gray-400 ring-1 ring-inset ring-gray-500/30',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const safeStatus = status || 'NORMAL';
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
        styles[safeStatus] || styles.NORMAL
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {safeStatus.replace('_', ' ')}
    </span>
  );
}