-- SQL Functions for updating stats

CREATE OR REPLACE FUNCTION public.increment_wins(agent_uuid UUID, amount NUMERIC)
RETURNS void AS $$
BEGIN
    UPDATE public.agents
    SET total_wins = total_wins + 1,
        total_earnings_mon = total_earnings_mon + amount,
        last_active = now()
    WHERE id = agent_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.increment_losses(agent_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.agents
    SET total_losses = total_losses + 1,
        last_active = now()
    WHERE id = agent_uuid;
END;
$$ LANGUAGE plpgsql;
