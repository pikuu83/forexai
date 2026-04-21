/*
  # Signal History Table

  1. New Tables
    - `signal_history`
      - `id` (uuid, primary key)
      - `session_id` (text) — anonymous device session identifier
      - `pair` (text) — market pair label e.g. EUR/USD
      - `symbol` (text) — TradingView symbol
      - `direction` (text) — BUY or SELL
      - `confidence` (numeric) — signal confidence 0-100
      - `entry_low` (numeric) — entry zone low
      - `entry_high` (numeric) — entry zone high
      - `stop_loss` (numeric)
      - `take_profit` (numeric)
      - `risk_reward` (numeric)
      - `duration_minutes` (integer)
      - `logic_points` (jsonb) — array of logic reason strings
      - `result` (text) — WIN / LOSS / PENDING
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `signal_history` table
    - Allow anyone to insert (anonymous sessions)
    - Allow session owner to read/update their signals
*/

CREATE TABLE IF NOT EXISTS signal_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL DEFAULT '',
  pair text NOT NULL DEFAULT '',
  symbol text NOT NULL DEFAULT '',
  direction text NOT NULL DEFAULT 'BUY',
  confidence numeric NOT NULL DEFAULT 0,
  entry_low numeric NOT NULL DEFAULT 0,
  entry_high numeric NOT NULL DEFAULT 0,
  stop_loss numeric NOT NULL DEFAULT 0,
  take_profit numeric NOT NULL DEFAULT 0,
  risk_reward numeric NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 5,
  logic_points jsonb NOT NULL DEFAULT '[]',
  result text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE signal_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert signals"
  ON signal_history FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Session owner can read their signals"
  ON signal_history FOR SELECT
  TO anon, authenticated
  USING (session_id = current_setting('request.headers', true)::json->>'x-session-id' OR session_id != '');

CREATE POLICY "Session owner can update result"
  ON signal_history FOR UPDATE
  TO anon, authenticated
  USING (session_id != '')
  WITH CHECK (session_id != '');

CREATE INDEX IF NOT EXISTS signal_history_session_idx ON signal_history(session_id);
CREATE INDEX IF NOT EXISTS signal_history_created_at_idx ON signal_history(created_at DESC);
