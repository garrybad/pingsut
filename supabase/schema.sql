-- SQL Schema for Pingsut

-- 1. Agents Table
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_address TEXT NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    total_earnings_mon NUMERIC DEFAULT 0,
    last_active TIMESTAMPTZ DEFAULT now()
);

-- 2. Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blockchain_game_id BIGINT UNIQUE, -- ID from smart contract
    tier TEXT NOT NULL CHECK (tier IN ('A', 'B', 'C', 'D', 'E')),
    wager_amount NUMERIC NOT NULL,
    player1_address TEXT NOT NULL,
    player2_address TEXT,
    player1_agent_id UUID REFERENCES public.agents(id),
    player2_agent_id UUID REFERENCES public.agents(id),
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'revealing', 'completed', 'draw')),
    winner_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Match Chats (Taunting & Bluffing)
CREATE TABLE IF NOT EXISTS public.match_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    sender_address TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'chat' CHECK (type IN ('chat', 'system', 'taunt', 'bluff')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Leaderboard View (Simple version)
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    id,
    name,
    total_wins,
    total_losses,
    total_earnings_mon,
    (total_wins::float / NULLIF(total_wins + total_losses, 0)) as win_rate
FROM public.agents
ORDER BY total_earnings_mon DESC;

-- Enable Realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
