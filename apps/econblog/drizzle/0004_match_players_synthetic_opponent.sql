ALTER TABLE pricewar.match_players
  ADD COLUMN IF NOT EXISTS synthetic_opponent_id text;
