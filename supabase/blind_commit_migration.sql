-- Migration for Blind Commit Reveal (Synchronized)

-- Reset matches to support the new flow
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS p1_move_committed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS p2_move_committed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS p1_move_secret INTEGER; -- Hidden until reveal
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS p2_move_secret INTEGER; -- Hidden until reveal
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS reveal_at TIMESTAMPTZ;

-- Policy Update: Ensure players can't see secret moves
-- (Simplified for now, in a real production app you'd use RLS or an API filter)
