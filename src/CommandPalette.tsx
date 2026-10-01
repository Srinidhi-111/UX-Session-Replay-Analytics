import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from './SessionContext';
import type { Session } from './types';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const navigate = useNavigate();
  const { setSelectedSessionId } = useSessionContext();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/sessions`)
      .then((res) => res.json())
      .then(setSessions)
      .catch(() => {});
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-start justify-center pt-24 z-[200]"
      onClick={() => setOpen(false)}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
        <Command className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <Command.Input
            placeholder="Jump to a page or session..."
            className="w-full bg-transparent text-white px-4 py-3 outline-none border-b border-gray-800 text-sm"
          />
          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="text-gray-500 text-sm p-3">
              No results found.
            </Command.Empty>

            <Command.Group heading="Pages" className="text-xs text-gray-500 px-2 py-1">
              {[
                { label: 'Sessions', path: '/' },
                { label: 'Rage Click Alerts', path: '/alerts' },
                { label: 'Heatmap', path: '/heatmap' },
                { label: 'Timeline', path: '/timeline' },
              ].map((item) => (
                <Command.Item
                  key={item.path}
                  onSelect={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                  className="px-3 py-2 rounded-lg text-sm text-white cursor-pointer aria-selected:bg-gray-800"
                >
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Sessions" className="text-xs text-gray-500 px-2 py-1">
              {sessions.slice(0, 20).map((s) => (
                <Command.Item
                  key={s.id}
                  onSelect={() => {
                    setSelectedSessionId(s.id);
                    navigate('/');
                    setOpen(false);
                  }}
                  className="px-3 py-2 rounded-lg text-sm text-gray-300 cursor-pointer aria-selected:bg-gray-800"
                >
                  {s.page_url} — {new Date(s.start_time + 'Z').toLocaleString()}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}