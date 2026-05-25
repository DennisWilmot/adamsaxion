-- Run via: pnpm -F @adamsaxion/econblog db:push
-- Also disable PostgREST exposure for `pricewar` in Supabase dashboard (API → Exposed schemas).

CREATE SCHEMA IF NOT EXISTS pricewar;
