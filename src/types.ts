export interface Session {
  id: string;
  page_url: string;
  start_time: string;
  end_time: string | null;
  rage_click_count: number;
  device_type: string | null;
  duration_ms: number;
  status: 'RAGE_CLICK' | 'ABANDONED' | 'NORMAL' | 'CONVERTED';
}

export interface Stats {
  total_sessions: number;
  bounce_rate: number;
  avg_duration_ms: number;
  total_rage_clicks: number;
}

export interface HeatmapZone {
  range: string;
  clicks: number;
}