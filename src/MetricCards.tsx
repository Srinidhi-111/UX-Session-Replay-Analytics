import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingDown, Clock, Flame } from 'lucide-react';
import type { Stats } from './types';
import { useCountUp } from './useCountUp';

export function MetricCards() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchStats = () => {
      fetch(`${import.meta.env.VITE_API_URL}/api/sessions/stats`)
        .then((res) => res.json())
        .then(setStats)
        .catch((err) => console.error('Failed to load stats:', err));
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const sessionsCount = useCountUp(stats?.total_sessions ?? 0);
  const rageCount = useCountUp(stats?.total_rage_clicks ?? 0);
  const bounceCount = useCountUp(stats ? Math.round(stats.bounce_rate * 10) : 0);
  const durationCount = useCountUp(stats ? Math.round(stats.avg_duration_ms / 100) : 0);

  if (!stats) return null;

  const cards = [
    {
      label: 'Sessions',
      value: sessionsCount,
      icon: Users,
      color: 'text-white',
      border: 'border-gray-800 hover:border-gray-600',
      glow: 'shadow-[0_0_25px_-6px_rgba(255,255,255,0.2)]',
    },
    {
      label: 'Bounce Rate',
      value: `${(bounceCount / 10).toFixed(1)}%`,
      icon: TrendingDown,
      color: 'text-amber-400',
      border: 'border-amber-900/50 hover:border-amber-700',
      glow: 'shadow-[0_0_25px_-6px_rgba(251,191,36,0.45)]',
    },
    {
      label: 'Avg Duration',
      value: `${(durationCount / 10).toFixed(1)}s`,
      icon: Clock,
      color: 'text-white',
      border: 'border-gray-800 hover:border-gray-600',
      glow: 'shadow-[0_0_25px_-6px_rgba(255,255,255,0.2)]',
    },
    {
      label: 'Rage Clicks',
      value: rageCount,
      icon: Flame,
      color: 'text-danger',
      border: 'border-red-900/50 hover:border-red-700',
      glow: 'shadow-[0_0_25px_-6px_rgba(239,68,68,0.5)]',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className={`bg-gray-900 border rounded-xl p-5 hover:-translate-y-0.5 transition-all duration-200 ${card.border} ${card.glow}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                {card.label}
              </p>
              <Icon className={`w-4 h-4 ${card.color} opacity-70`} />
            </div>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
}