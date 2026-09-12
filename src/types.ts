export interface Session {
  id: string;
  page_url: string;
  start_time: string;
  end_time: string | null;
  rage_click_count: number;
  device_type: string | null;
}