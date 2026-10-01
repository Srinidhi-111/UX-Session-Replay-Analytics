import { useEffect, useState } from 'react';

interface PageStat {
  page_url: string;
  rage_click_count: number;
}

export function TopProblemPages() {
  const [pages, setPages] = useState<PageStat[]>([]);

  useEffect(() => {
    const fetchPages = () => {
      fetch(`${import.meta.env.VITE_API_URL}/api/top-pages`)
        .then((res) => res.json())
        .then(setPages)
        .catch((err) => console.error('Failed to load top pages:', err));
    };
    fetchPages();
    const interval = setInterval(fetchPages, 5000);
    return () => clearInterval(interval);
  }, []);

  if (pages.length === 0) return null;

  const maxCount = Math.max(...pages.map((p) => p.rage_click_count));

  return (
    <div className="border border-gray-800 rounded-lg p-4 mx-4 mb-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
        Top Problem Pages
      </p>
      <div className="space-y-2">
        {pages.map((p) => (
          <div key={p.page_url} className="flex items-center gap-3">
            <span className="text-sm text-white w-40 truncate">{p.page_url}</span>
            <div className="flex-1 bg-gray-900 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-danger rounded-full"
                style={{ width: `${(p.rage_click_count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-sm text-danger font-semibold w-8 text-right">
              {p.rage_click_count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}