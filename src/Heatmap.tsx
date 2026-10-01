import { useEffect, useState } from 'react';
import type { HeatmapZone } from './types';

interface Point {
  x: number;
  y: number;
}

interface HeatmapProps {
  sessionId: string | null;
}

function zoneColor(rank: number): string {
  if (rank === 0) return 'text-danger';
  if (rank === 1) return 'text-amber-400';
  return 'text-blue-400';
}

function zoneLabel(rank: number): string {
  if (rank === 0) return 'Hottest Zone';
  if (rank === 1) return 'Medium Zone';
  return 'Cold Zone';
}

function clusterPoints(points: Point[]) {
  const clusters: { x: number; y: number; count: number }[] = [];
  const radius = 60;

  for (const p of points) {
    const existing = clusters.find(
      (c) => Math.hypot(c.x - p.x, c.y - p.y) < radius
    );
    if (existing) {
      existing.x = (existing.x * existing.count + p.x) / (existing.count + 1);
      existing.y = (existing.y * existing.count + p.y) / (existing.count + 1);
      existing.count += 1;
    } else {
      clusters.push({ x: p.x, y: p.y, count: 1 });
    }
  }
  return clusters;
}

export function Heatmap({ sessionId }: HeatmapProps) {
  const [zones, setZones] = useState<HeatmapZone[]>([]);
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
    const fetchHeatmap = () => {
      const url = new URL(`${import.meta.env.VITE_API_URL}/api/heatmap`);
      if (sessionId) url.searchParams.set('session_id', sessionId);

      fetch(url.toString())
        .then((res) => res.json())
        .then((data) => {
          setZones(data.zones);
          setPoints(data.points);
        })
        .catch((err) => console.error('Failed to load heatmap:', err));
    };

    fetchHeatmap();
    const interval = setInterval(fetchHeatmap, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const clusters = clusterPoints(points);
  const maxCount = Math.max(1, ...clusters.map((c) => c.count));

  function clusterColor(count: number) {
    const ratio = count / maxCount;
    if (ratio > 0.6) return 'rgba(239, 68, 68, 0.6)';
    if (ratio > 0.3) return 'rgba(245, 158, 11, 0.5)';
    return 'rgba(59, 130, 246, 0.4)';
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
        Click Density Map {sessionId ? '(this session)' : '(all sessions)'}
      </p>

      <div className="relative bg-gray-950 rounded-lg mb-3 overflow-hidden flex-1 min-h-[300px]">
        {clusters.map((c, i) => {
          const size = 24 + (c.count / maxCount) * 60;
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${Math.min(95, (c.x / 1000) * 100)}%`,
                top: `${Math.min(85, (c.y / 1000) * 100)}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: clusterColor(c.count),
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Red = most clicks · Amber = medium · Blue = few
      </p>

      <div className="grid grid-cols-3 gap-2 shrink-0">
        {zones.slice(0, 3).map((zone, i) => (
          <div
            key={zone.range}
            className="bg-gray-900 border border-gray-800 rounded-lg p-3"
          >
            <p className={`text-sm font-medium ${zoneColor(i)}`}>{zoneLabel(i)}</p>
            <p className="text-xs text-gray-500 mb-1">{zone.range}</p>
            <span className={`text-lg font-semibold ${zoneColor(i)}`}>
              {zone.clicks}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}