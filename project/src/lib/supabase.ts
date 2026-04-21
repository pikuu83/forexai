import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getSessionId(): string {
  const key = 'trading_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export interface SignalHistoryRow {
  id: string;
  session_id: string;
  pair: string;
  symbol: string;
  direction: string;
  confidence: number;
  entry_low: number;
  entry_high: number;
  stop_loss: number;
  take_profit: number;
  risk_reward: number;
  duration_minutes: number;
  logic_points: string[];
  result: string;
  created_at: string;
}

export async function saveSignal(data: Omit<SignalHistoryRow, 'id' | 'created_at'>): Promise<string | null> {
  const { data: row, error } = await supabase
    .from('signal_history')
    .insert(data)
    .select('id')
    .maybeSingle();
  if (error) return null;
  return row?.id ?? null;
}

export async function updateSignalResult(id: string, result: 'WIN' | 'LOSS'): Promise<void> {
  await supabase.from('signal_history').update({ result }).eq('id', id);
}

export async function fetchSignalHistory(sessionId: string): Promise<SignalHistoryRow[]> {
  const { data } = await supabase
    .from('signal_history')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(50);
  return (data as SignalHistoryRow[]) ?? [];
}
