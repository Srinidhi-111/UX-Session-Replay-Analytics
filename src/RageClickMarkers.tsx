interface RageClickMarkersProps {
  rageClicks: number[];
  sessionStart: number;
  sessionEnd: number;
}

export function RageClickMarkers({ rageClicks, sessionStart, sessionEnd }: RageClickMarkersProps) {
  const duration = sessionEnd - sessionStart;
  if (duration <= 0) return null;

  return (
    <div className="relative h-3 w-full bg-gray-900 rounded mb-2">
      {rageClicks.map((timestamp, i) => {
        const percent = ((timestamp - sessionStart) / duration) * 100;
        const clamped = Math.min(100, Math.max(0, percent));
        return (
          <div
            key={i}
            className="absolute top-0 w-1 h-3 bg-danger rounded"
            style={{ left: `${clamped}%` }}
            title={`Rage click at ${new Date(timestamp).toLocaleTimeString()}`}
          />
        );
      })}
    </div>
  );
}