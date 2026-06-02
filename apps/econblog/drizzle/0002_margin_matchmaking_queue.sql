ALTER TABLE pricewar.matchmaking_queue
  ADD COLUMN IF NOT EXISTS synthetic_delay_sec integer,
  ADD COLUMN IF NOT EXISTS pending_match_id uuid,
  ADD COLUMN IF NOT EXISTS human_matched_at timestamptz;
