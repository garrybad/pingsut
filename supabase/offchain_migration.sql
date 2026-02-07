-- Migration to support Full Off-chain gameplay

-- Add columns to matches table
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS p1_commitment TEXT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS p2_move INTEGER;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS p1_move INTEGER;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS salt TEXT;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Update status check constraint if necessary
-- Note: PostgreSQL doesn't allow direct ALTER for CHECK constraints easily, 
-- but our previous 'waiting', 'matched', 'revealing', 'completed', 'draw', 'timeout' should still work.
